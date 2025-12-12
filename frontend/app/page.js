'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axiosInstance from '@/api/axios';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Categories are defined as enum in backend: NFC_CARD, NFC_TAG
        const categoriesData = [
          { _id: 'NFC_CARD', name: 'NFC Card' },
          { _id: 'NFC_TAG', name: 'NFC Tag' }
        ];
        
        const productsRes = await axiosInstance.get('/products?limit=8');
        setCategories(categoriesData);
        setFeaturedProducts(productsRes.data.data.products || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to NFC Store</h1>
          <p className="text-xl text-blue-100 mb-8">Discover the latest NFC products and solutions</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">Shop by Category</h2>
            <p className="text-center text-gray-600">Browse our extensive collection of NFC products</p>
          </div>
          {loading ? (
            <div className="text-center text-gray-600 py-8">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-5xl mb-4">{category.icon || '📱'}</div>
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">Explore collection</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-2">Handpicked products for you</p>
              </div>
              <Link
                href="/products"
                className="text-blue-600 hover:text-blue-700 font-semibold text-lg transition"
              >
                View All →
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-gray-600 py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Explore our complete range of NFC products and find the perfect solution for your needs</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}

