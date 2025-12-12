'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/api/axios';
import { formatPrice } from '@/utils/formatPrice';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 'FIVE', title: '', comment: '' });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlist();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axiosInstance.get(`/products/${productId}`);
      setProduct(res.data.data);
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get(`/reviews/product/${productId}`);
      setReviews(res.data.data.reviews || []);
    } catch (error) {
      console.log('No reviews yet');
    }
  };

  const checkWishlist = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get('/wishlist');
      const isInWishlist = res.data.data.items.some(item => item.productId === productId);
      setInWishlist(isInWishlist);
    } catch (error) {
      console.log('Wishlist check failed');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (quantity > product.stock) {
      toast.error('Quantity exceeds available stock');
      return;
    }
    addToCart(productId, quantity);
    toast.success('Added to cart!');
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (inWishlist) {
        await axiosInstance.delete(`/wishlist/item/${productId}`);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await axiosInstance.post('/wishlist/add', { productId });
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await axiosInstance.post(`/reviews/product/${productId}`, reviewForm);
      toast.success('Review posted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 'FIVE', title: '', comment: '' });
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post review');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Product not found</div>;
  }

  const ratingMap = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  const avgRating = product.averageRating ? ratingMap[product.averageRating] : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-lg mb-4 overflow-hidden h-96">
            {product.images && product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded cursor-pointer border-2 ${
                    selectedImage === idx ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Rating */}
          {product.totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.round(avgRating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-gray-600">({product.totalReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="text-4xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</div>

          {/* Stock */}
          <div className="mb-4">
            <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b last:border-b-0">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600"
              >
                −
              </button>
              <span className="px-6 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 text-gray-600"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              Add to Cart
            </button>

            <button
              onClick={handleAddToWishlist}
              className={`px-6 py-2 rounded-lg font-semibold border-2 ${
                inWishlist ? 'bg-red-50 text-red-600 border-red-600' : 'text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {inWishlist ? '❤️ Saved' : '🤍 Save'}
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p>✓ Free shipping on orders over ₹500</p>
            <p>✓ Easy returns within 30 days</p>
            <p>✓ Secure checkout with Razorpay</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {user && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mb-4">
              <label className="block font-semibold mb-2">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="FIVE">5 Stars ★★★★★</option>
                <option value="FOUR">4 Stars ★★★★☆</option>
                <option value="THREE">3 Stars ★★★☆☆</option>
                <option value="TWO">2 Stars ★★☆☆☆</option>
                <option value="ONE">1 Star ★☆☆☆☆</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Title</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                placeholder="Brief title of your review"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your experience with this product..."
                className="w-full px-4 py-2 border rounded-lg"
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Post Review
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{review.user.name}</p>
                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-yellow-400">
                    {'★'.repeat(ratingMap[review.rating])}{'☆'.repeat(5 - ratingMap[review.rating])}
                  </div>
                </div>
                <h4 className="font-semibold mb-2">{review.title}</h4>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <button className="text-sm text-blue-600 hover:underline">
                  👍 Helpful ({review.helpfulCount})
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images || [product.image].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="relative h-96 w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={images[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-full rounded overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img || '/placeholder-product.jpg'}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-bold text-primary-600 mb-4">
            {formatPrice(product.price)}
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Specs Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Specifications</h2>
              <table className="w-full border-collapse">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b">
                      <td className="py-2 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="py-2 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-semibold">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

