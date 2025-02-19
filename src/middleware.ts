// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  console.log('Middleware Check:', {
    path,
    hasToken: !!token,
    userRole,
    fullUrl: request.url
  });

  // Protect dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!token) {
      console.log('No token - redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check specific dashboard access
    if (path === '/dashboard/admin' && userRole !== 'admin') {
      console.log('Non-admin accessing admin dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (path === '/dashboard/society' && userRole !== 'society_head') {
      console.log('Non-society head accessing society dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Don't redirect if already on correct path
    if (path === '/dashboard') {
      console.log('Already on main dashboard - allowing access');
      return NextResponse.next();
    }
  }

  // Handle auth routes when user is already logged in
  if (token && (path === '/auth/login' || path === '/auth/register')) {
    console.log('Authenticated user accessing auth route');
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    if (userRole === 'society_head') {
      return NextResponse.redirect(new URL('/dashboard/society', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ]
};