import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const API = 'http://localhost:5000/api';

export function CartProvider({ children }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) { setCart([]); return; }
    try {
      setLoading(true);
      const res = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) return false;
    try {
      const res = await axios.post(`${API}/cart/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
      return true;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    try {
      const res = await axios.put(`${API}/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return;
    try {
      const res = await axios.delete(`${API}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      await axios.delete(`${API}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, loading, cartCount, cartTotal,
      addToCart, updateQuantity, removeFromCart, clearCart, fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
