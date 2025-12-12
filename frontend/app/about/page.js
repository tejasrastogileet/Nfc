'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';
import { toast } from 'react-hot-toast';

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const res = await axiosInstance.get('/content/page/about');
      setContent(res.data.data);
    } catch (error) {
      // Use default content if not found
      setContent({
        title: 'About NFC Store',
        content: `At NFC Store, we're passionate about bringing Near Field Communication technology to everyone. 

Our Mission:
To make NFC technology accessible, affordable, and easy to use for businesses and individuals alike.

What We Offer:
- Premium NFC cards and tags
- Reliable NFC solutions
- Expert support and guidance
- Competitive pricing

Why Choose Us:
✓ High-quality products
✓ Fast shipping
✓ Excellent customer service
✓ Secure payments
✓ Easy returns

Contact us today to learn more about how NFC technology can benefit you!`
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">{content?.title || 'About Us'}</h1>
      <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content?.content}
      </div>
    </div>
  );
}
