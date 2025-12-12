'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axiosInstance from '@/api/axios';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-hot-toast';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    revenueData: [],
    ordersData: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get('/admin/analytics');
      // Handle different response structures
      const data = res.data;
      setAnalytics({
        revenueData: data.revenueData || data.monthlyRevenue || [],
        ordersData: data.ordersData || data.monthlyOrders || [],
        lowStockProducts: data.lowStockProducts || data.lowStock || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Total Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatPrice(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Orders Per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.ordersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#10b981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Low Stock Products</h3>
        {analytics.lowStockProducts.length === 0 ? (
          <p className="text-gray-600">No products with low stock</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.lowStockProducts}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#f59e0b" name="Stock" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

