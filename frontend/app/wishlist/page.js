'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/wishlist');
        return;
      }
      fetchWishlist();
    }
  }, [user, authLoading, router]);

  const fetchWishlist = async () => {
    try {
      const res = await axiosInstance.get('/wishlist');
      setWishlist(res.data.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await axiosInstance.delete(`/wishlist/item/${itemId}`);
      setWishlist({
        ...wishlist,
        items: wishlist.items.filter(item => item.id !== itemId)
      });
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) return;

    try {
      await axiosInstance.delete('/wishlist');
      setWishlist({ ...wishlist, items: [] });
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {wishlist?.items?.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {!wishlist?.items || wishlist.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Add products to your wishlist to save them for later</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                {item.product.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg line-clamp-2 mb-2">{item.product.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(item.product.price)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    item.product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {item.product.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/products/${item.product.id}`)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
