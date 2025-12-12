'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-hot-toast';

export default function RefundsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [formData, setFormData] = useState({
    reason: '',
    notes: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/refunds');
        return;
      }
      fetchRefundRequests();
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchRefundRequests = async () => {
    try {
      const res = await axiosInstance.get('/refunds');
      setRequests(res.data.data || []);
    } catch (error) {
      console.log('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      console.log('Failed to load orders');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Please select an order');
      return;
    }

    const order = orders.find(o => o.id === selectedOrder);
    if (!order) return;

    try {
      await axiosInstance.post('/refunds', {
        orderId: selectedOrder,
        reason: formData.reason,
        notes: formData.notes,
        refundAmount: order.totalAmount
      });
      toast.success('Refund request submitted successfully');
      setShowForm(false);
      setFormData({ reason: '', notes: '' });
      setSelectedOrder('');
      fetchRefundRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Refund Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showForm ? 'Cancel' : 'Request Refund'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4">New Refund Request</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Select Order</label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Choose an order...</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id.slice(0, 8)} - {formatPrice(order.totalAmount)} - {new Date(order.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Reason for Refund</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select reason...</option>
                <option value="DEFECTIVE">Product is defective</option>
                <option value="NOT_AS_DESCRIBED">Not as described</option>
                <option value="WRONG_ITEM">Wrong item received</option>
                <option value="CHANGED_MIND">Changed my mind</option>
                <option value="OTHER">Other reason</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Please provide additional details..."
                className="w-full px-4 py-2 border rounded-lg"
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Submit Refund Request
            </button>
          </form>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold mb-2">No refund requests</h2>
          <p className="text-gray-600">You haven't submitted any refund requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Order #{request.orderId.slice(0, 8)}</h3>
                  <p className="text-gray-600 text-sm">
                    Submitted on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600 text-sm">Refund Amount</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(request.refundAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Reason</p>
                  <p className="font-semibold">{request.reason}</p>
                </div>
              </div>

              {request.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Notes:</p>
                  <p className="text-gray-700 text-sm">{request.notes}</p>
                </div>
              )}

              {request.processedAt && (
                <p className="text-xs text-gray-500">
                  Processed on {new Date(request.processedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
