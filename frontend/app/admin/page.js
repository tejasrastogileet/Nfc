'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/api/axios';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/admin/stats');
      const data = res.data;
      setStats({
        totalRevenue: data.totalRevenue || data.revenue || 0,
        totalOrders: data.totalOrders || data.orders || 0,
        totalUsers: data.totalUsers || data.users || 0,
        totalProducts: data.totalProducts || data.products || 0,
        lowStockProducts: data.lowStockProducts || data.lowStock || 0,
        pendingOrders: data.pendingOrders || data.pending || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-primary-600">
            {formatPrice(stats.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm mb-2">Low Stock Products</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.lowStockProducts}
          </p>
          {stats.lowStockProducts > 0 && (
            <Link
              href="/admin/products?lowStock=true"
              className="text-sm text-primary-600 hover:underline mt-2 inline-block"
            >
              View Products →
            </Link>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-orange-600">
            {stats.pendingOrders}
          </p>
          {stats.pendingOrders > 0 && (
            <Link
              href="/admin/orders?status=pending"
              className="text-sm text-primary-600 hover:underline mt-2 inline-block"
            >
              View Orders →
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products/new"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center font-semibold"
          >
            Add New Product
          </Link>
          <Link
            href="/admin/coupons/new"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-semibold"
          >
            Create Coupon
          </Link>
          <Link
            href="/admin/analytics"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center font-semibold"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}

