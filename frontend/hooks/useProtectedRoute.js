'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export const useProtectedRoute = (requireAdmin = false) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requireAdmin && user.role !== 'admin') {
        router.push('/');
        toast.error('Access denied. Admin only.');
      }
    }
  }, [user, loading, requireAdmin, router]);

  return { user, loading };
};

