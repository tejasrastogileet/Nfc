'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';
import { toast } from 'react-hot-toast';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, [selectedCategory]);

  const fetchFAQs = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const res = await axiosInstance.get('/content/faqs', { params });
      setFaqs(res.data.data.faqs || []);
      setCategories(res.data.data.categories || []);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">Find answers to common questions about NFC Store and our products</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-12">
            <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Filter by Category</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQs List */}
        {faqs.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No FAQs Found</h3>
            <p className="text-gray-600 mb-6">We don't have any FAQs in this category yet. Please check back soon or reach out to our support team.</p>
            <a
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full px-8 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-lg text-gray-900">{faq.question}</span>
                  <div className={`flex-shrink-0 ml-4 transition-transform duration-300 ${
                    expandedId === faq.id ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </button>

                {expandedId === faq.id && (
                  <div className="px-8 py-5 bg-blue-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 mt-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-blue-100 text-lg mb-8">Our support team is ready to help you. Get in touch with us today!</p>
          <a
            href="/contact"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Contact Our Support Team
          </a>
        </div>
      </div>
    </div>
  );
}
