'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';

export default function PrivacyPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const res = await axiosInstance.get('/content/page/privacy');
      setContent(res.data.data);
    } catch (error) {
      setContent({
        title: 'Privacy Policy',
        content: `PRIVACY POLICY

Last Updated: December 2025

1. INTRODUCTION
NFC Store ("we", "our", or "us") operates the NFC Store website and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.

2. INFORMATION WE COLLECT
We collect information you provide directly:
- Account information (name, email, phone)
- Shipping and billing addresses
- Payment information
- Order history
- Communication preferences

We also collect automatically:
- Usage information and browsing history
- Device information
- IP address and location data
- Cookies and similar tracking technologies

3. HOW WE USE YOUR INFORMATION
We use your information to:
- Process orders and payments
- Send order updates and notifications
- Improve our services
- Comply with legal obligations
- Prevent fraud and secure accounts
- Send marketing communications (with consent)

4. DATA SECURITY
We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.

5. THIRD-PARTY SHARING
We do not sell your personal information. We may share information with:
- Payment processors (Razorpay)
- Shipping partners
- Service providers
- Legal authorities when required

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Opt-out of marketing communications
- Data portability

7. COOKIES
We use cookies to enhance your experience. You can control cookies through your browser settings.

8. CONTACT US
For privacy concerns, contact us at: privacy@nfcstore.com`
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
      <h1 className="text-4xl font-bold mb-6">{content?.title || 'Privacy Policy'}</h1>
      <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content?.content}
      </div>
    </div>
  );
}
