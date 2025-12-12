'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';

export default function TermsPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const res = await axiosInstance.get('/content/page/terms');
      setContent(res.data.data);
    } catch (error) {
      setContent({
        title: 'Terms & Conditions',
        content: `TERMS & CONDITIONS

Last Updated: December 2025

1. ACCEPTANCE OF TERMS
By accessing and using the NFC Store website and services, you agree to be bound by these Terms & Conditions.

2. USER ACCOUNTS
- You are responsible for maintaining account confidentiality
- You agree to provide accurate information
- You are responsible for all activity on your account
- You must be 18+ to create an account

3. PRODUCT INFORMATION
- We strive for accuracy in product descriptions and pricing
- Prices are subject to change without notice
- We reserve the right to limit quantities
- All products are subject to availability

4. ORDERS AND PAYMENTS
- All orders are subject to acceptance and verification
- We use Razorpay for secure payment processing
- Payment must be received before order processing
- Order confirmation via email serves as a receipt

5. SHIPPING AND DELIVERY
- We ship to addresses within India
- Delivery times are estimates and not guarantees
- Risk of loss passes to you upon delivery
- Shipping fees are calculated at checkout

6. RETURNS AND REFUNDS
- Returns must be requested within 30 days of delivery
- Items must be unused and in original packaging
- Refunds are processed within 7-10 business days
- Shipping costs are non-refundable
- Damaged items should be reported within 48 hours

7. INTELLECTUAL PROPERTY
- All content on our site is protected by copyright
- You may not reproduce or distribute our content
- Trademarks are property of NFC Store

8. LIMITATION OF LIABILITY
- We are not liable for indirect or consequential damages
- Our total liability is limited to the amount paid
- Some jurisdictions don't allow liability limitations

9. DISPUTE RESOLUTION
- Disputes shall be governed by Indian law
- Any legal action must be filed in appropriate courts

10. CHANGES TO TERMS
- We reserve the right to modify these terms
- Continued use indicates acceptance of new terms

11. CONTACT US
For questions about these terms, contact: legal@nfcstore.com`
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
      <h1 className="text-4xl font-bold mb-6">{content?.title || 'Terms & Conditions'}</h1>
      <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
        {content?.content}
      </div>
    </div>
  );
}
