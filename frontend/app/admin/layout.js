'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin()) {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <nav className="flex space-x-4">
            <Link
              href="/admin"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded"
            >
              Orders
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded"
            >
              Users
            </Link>
            <Link
              href="/admin/coupons"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded"
            >
              Coupons
            </Link>
            <Link
              href="/admin/analytics"
              className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded"
            >
              Analytics
            </Link>
          </nav>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

