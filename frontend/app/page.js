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
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to NFC Store</h1>
          <p className="text-xl mb-8">Discover the latest NFC products and solutions</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          {loading ? (
            <div className="text-center">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-4xl mb-4">{category.icon || '📱'}</div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center">Loading products...</div>
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
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Explore our complete range of NFC products</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}

