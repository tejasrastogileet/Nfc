'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function CheckoutLayout({ children }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cartItems } = useCart();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      if (cartItems.length === 0) {
        router.push('/cart');
        return;
      }
    }
  }, [user, authLoading, cartItems, router]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Loading...
      </div>
    );
  }

  if (!user || cartItems.length === 0) {
    return null;
  }

  return <>{children}</>;
}

