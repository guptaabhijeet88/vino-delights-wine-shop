const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create dummy payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const cartTotal = user.cart.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const shippingCost = cartTotal >= 5000 ? 0 : 299;
    const totalAmount = cartTotal + shippingCost;

    // Generate a dummy order ID
    const dummyOrderId = 'VINO_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    res.json({
      orderId: dummyOrderId,
      amount: totalAmount * 100, // in paise
      currency: 'INR',
      status: 'created'
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment order creation failed', error: error.message });
  }
});

// Verify dummy payment and create order
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId, shippingAddress } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Missing order ID' });
    }

    // Create order in database
    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = user.cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Generate a dummy payment ID
    const paymentId = 'PAY_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'Online Payment (Demo)',
      paymentId: paymentId,
      status: 'Confirmed'
    });

    await order.save();

    // Update stock
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    user.cart = [];
    await user.save();

    res.status(201).json({ message: 'Payment successful', order });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

module.exports = router;
