import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // Check localStorage is not possible in middleware, so we'll handle it client-side
      // This is a basic check - full protection is in the page components
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

