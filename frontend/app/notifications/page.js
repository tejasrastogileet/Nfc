'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchNotifications();
  }, [user, filter]);

  const fetchNotifications = async () => {
    try {
      const unreadOnly = filter === 'unread';
      const res = await axiosInstance.get('/notifications', {
        params: { unreadOnly, limit: 50 }
      });
      setNotifications(res.data.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.patch('/notifications/read/all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`pb-3 font-semibold ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`pb-3 font-semibold ${
            filter === 'unread'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-semibold mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </h2>
          <p className="text-gray-600">
            You're all caught up! We'll notify you when something important happens.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg p-4 border-l-4 flex justify-between items-start ${
                notification.isRead
                  ? 'bg-gray-50 border-l-gray-300'
                  : 'bg-blue-50 border-l-blue-500'
              }`}
            >
              <div className="flex-1">
                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-900' : 'text-blue-900'}`}>
                  {notification.title}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
