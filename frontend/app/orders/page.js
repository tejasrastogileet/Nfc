'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/api/axios';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/orders');
        return;
      }
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      const res = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">You have no orders yet</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-lg font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-primary-600">
                    {formatPrice(order.total)}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {(order.items || []).map((item, idx) => {
                    const itemId = item._id || item.product?._id || idx;
                    const itemName = item.name || item.product?.name || 'Product';
                    const itemPrice = item.price || item.product?.price || 0;
                    const itemQuantity = item.quantity || 1;
                    
                    return (
                      <div
                        key={itemId}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {itemName} x {itemQuantity}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(itemPrice * itemQuantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.name}
                    <br />
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.pincode}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <button
                  onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-semibold"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

