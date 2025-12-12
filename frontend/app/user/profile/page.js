'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
    fetchAddresses();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/user/profile');
      setProfile(res.data.data);
      setFormData(res.data.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await axiosInstance.get('/user/addresses');
      setAddresses(res.data.data);
    } catch (error) {
      console.log('Failed to load addresses');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/user/profile', {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        avatar: formData.avatar
      });
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/user/addresses', newAddress);
      toast.success('Address added successfully');
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Delete this address?')) return;
    try {
      await axiosInstance.delete(`/user/addresses/${addressId}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await axiosInstance.post('/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Account Menu</h3>
            <nav className="space-y-2">
              <button onClick={() => window.location.hash = '#profile'} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Profile</button>
              <button onClick={() => window.location.hash = '#addresses'} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Addresses</button>
              <button onClick={() => window.location.hash = '#security'} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Security</button>
              <button onClick={() => router.push('/orders')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Orders</button>
              <button onClick={() => router.push('/wishlist')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Wishlist</button>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded font-semibold"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div id="profile" className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {!editMode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Name</p>
                  <p className="text-lg font-semibold">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="text-lg font-semibold">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="text-lg font-semibold">{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Bio</p>
                  <p className="text-lg font-semibold">{profile?.bio || 'No bio'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>

          {/* Addresses Section */}
          <div id="addresses" className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {showAddressForm ? 'Cancel' : 'Add Address'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="col-span-2 px-4 py-2 border rounded-lg"
                    required
                  />
                  <label className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="mr-2"
                    />
                    <span>Set as default address</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Add Address
                </button>
              </form>
            )}

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-gray-600">No addresses saved yet</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{addr.name}</h4>
                      <p className="text-gray-600 text-sm">
                        {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                      </p>
                      <p className="text-gray-600 text-sm">Phone: {addr.phone}</p>
                      {addr.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">Default</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Section */}
          <div id="security" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Security</h2>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Change Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
