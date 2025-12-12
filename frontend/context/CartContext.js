'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/api/axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from backend when user is logged in, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      // Check if user is logged in by checking for token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token) {
        // Load from backend
        try {
          setLoading(true);
          const res = await axiosInstance.get('/cart');
          setCartItems(res.data.items || res.data || []);
        } catch (error) {
          console.error('Error loading cart from backend:', error);
          // Fallback to localStorage if backend fails
          loadFromLocalStorage();
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for guest users
        loadFromLocalStorage();
      }
    };

    loadCart();
  }, []);

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  };

  const syncToBackend = async (items) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        await axiosInstance.put('/cart', { items });
      } catch (error) {
        console.error('Error syncing cart to backend:', error);
      }
    }
  };

  const syncToLocalStorage = (items) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const newItems = [...cartItems];
    const existingIndex = newItems.findIndex((item) => item.product?._id === product._id || item._id === product._id);
    
    if (existingIndex >= 0) {
      // Update existing item
      const existingItem = newItems[existingIndex];
      const currentQty = existingItem.quantity || 0;
      newItems[existingIndex] = {
        ...existingItem,
        product: product._id || product,
        quantity: currentQty + quantity,
      };
    } else {
      // Add new item
      newItems.push({
        product: product._id || product,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      });
    }

    setCartItems(newItems);
    syncToLocalStorage(newItems);
    await syncToBackend(newItems);
    toast.success('Added to cart!');
  };

  const removeFromCart = async (productId) => {
    const newItems = cartItems.filter(
      (item) => (item.product?._id || item._id) !== productId
    );
    setCartItems(newItems);
    syncToLocalStorage(newItems);
    await syncToBackend(newItems);
    toast.success('Item removed from cart');
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newItems = cartItems.map((item) => {
      const itemId = item.product?._id || item._id;
      if (itemId === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    setCartItems(newItems);
    syncToLocalStorage(newItems);
    await syncToBackend(newItems);
  };

  const clearCart = async () => {
    setCartItems([]);
    syncToLocalStorage([]);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        await axiosInstance.delete('/cart');
      } catch (error) {
        console.error('Error clearing cart on backend:', error);
      }
    }
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

