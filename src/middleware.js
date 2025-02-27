import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public routes - allow access
    if (
      path === '/' ||
      path.startsWith('/auth') ||
      path.startsWith('/api/auth') ||
      path.startsWith('/_next') ||
      path.startsWith('/images')
    ) {
      return NextResponse.next();
    }

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Redirect to appropriate dashboard if accessing wrong role's routes
    const redirectToDashboard = () => {
      switch (token.role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        case 'OWNER':
          return NextResponse.redirect(new URL('/owner/dashboard', req.url));
        case 'CUSTOMER':
          return NextResponse.redirect(new URL('/customer/dashboard', req.url));
        default:
          return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    };

    // Protected admin routes
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      if (token.role !== 'ADMIN') {
        return redirectToDashboard();
      }
    }

    // Protected owner routes
    if (path.startsWith('/owner') || path.startsWith('/api/owner')) {
      if (token.role !== 'OWNER') {
        return redirectToDashboard();
      }
    }

    // Protected customer routes
    if (path.startsWith('/customer') || path.startsWith('/api/customer')) {
      if (token.role !== 'CUSTOMER') {
        return redirectToDashboard();
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|logo.png).*)',
    '/api/:path*',
  ],
};
