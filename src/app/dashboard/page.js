'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      switch (session.user.role) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'OWNER':
          router.push('/owner/dashboard');
          break;
        case 'CUSTOMER':
          router.push('/customer/dashboard');
          break;
        default:
          router.push('/');
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, session, router]);

  return <div>Redirecting...</div>;
} 