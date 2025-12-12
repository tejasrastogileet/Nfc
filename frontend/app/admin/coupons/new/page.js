'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { toast } from 'react-hot-toast';

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    minAmount: '',
    validUntil: '',
    maxUses: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/admin/coupons', {
        ...formData,
        discount: parseFloat(formData.discount),
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : 0,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validUntil: formData.validUntil || null,
      });
      toast.success('Coupon created successfully');
      router.push('/admin/coupons');
    } catch (error) {
      toast.error('Failed to create coupon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Coupon</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Coupon Code *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="SUMMER2024"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Discount Type *</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Discount Value *</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder={formData.discountType === 'percentage' ? '10' : '100'}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Amount</label>
          <input
            type="number"
            name="minAmount"
            value={formData.minAmount}
            onChange={handleChange}
            step="0.01"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Valid Until</label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Uses</label>
          <input
            type="number"
            name="maxUses"
            value={formData.maxUses}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="100"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

