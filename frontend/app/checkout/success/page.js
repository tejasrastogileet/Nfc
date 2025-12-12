'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/api/axios';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-hot-toast';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order?.orderNumber || orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-semibold">{order.orderNumber || orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold text-primary-600">
                {formatPrice(order.total || order.amount)}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Order Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : order.status === 'shipped'
                  ? 'bg-blue-100 text-blue-800'
                  : order.status === 'delivered'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
            </span>
          </div>

          {order.shippingAddress && (
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
              <p className="text-sm">
                {order.shippingAddress.name}
                <br />
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownloadInvoice}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Download Invoice
          </button>
          <Link
            href="/orders"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

