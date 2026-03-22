const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// ====== DASHBOARD STATS ======
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalProducts, totalUsers, orders, products] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ createdAt: -1 }),
      Product.find().select('name stock price image category')
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
    const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    // Recent 10 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Top selling products (from order items)
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        if (!productSales[key]) {
          productSales[key] = { name: key, quantity: 0, revenue: 0, image: item.image };
        }
        productSales[key].quantity += item.quantity;
        productSales[key].revenue += item.price * item.quantity;
      });
    });
    const topSelling = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Low stock products
    const lowStock = products.filter(p => p.stock < 15).sort((a, b) => a.stock - b.stock).slice(0, 5);

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short' }),
        revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        orders: monthOrders.length
      });
    }

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      recentOrders,
      topSelling,
      lowStock,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== PRODUCTS ======
router.get('/products', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/products', adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== ORDERS ======
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ====== USERS ======
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password -cart').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -cart');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
