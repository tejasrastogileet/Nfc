'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axiosInstance from '@/api/axios';
import { toast } from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axiosInstance.get('/admin/coupons');
      setCoupons(res.data.coupons || res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/coupons/${couponId}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading coupons...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <Link
          href="/admin/coupons/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Create New Coupon
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Min Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valid Until
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="px-6 py-4 font-medium">{coupon.code}</td>
                <td className="px-6 py-4">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discount}%`
                    : `₹${coupon.discount}`}
                </td>
                <td className="px-6 py-4 text-gray-600 capitalize">
                  {coupon.discountType}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  ₹{coupon.minAmount || 0}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {coupon.validUntil
                    ? new Date(coupon.validUntil).toLocaleDateString()
                    : 'No expiry'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

