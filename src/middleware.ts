import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the Firebase ID token from cookies
  const token = request.cookies.get('firebaseToken')?.value;

  // Get the path
  const path = request.nextUrl.pathname;

  // Array of public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(path);

  // Array of protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/societies',
    '/events',
    '/announcements',
  ];

  // Check if the requested path matches any protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    path.startsWith(route)
  );

  // Handle root path
  if (path === '/') {
  return   NextResponse.next(); 
  }

  // Handle /login and /register paths (without /auth prefix)
  if (path === '/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  if (path === '/register') {
    return NextResponse.redirect(new URL('/auth/register', request.url));
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth pages with token, redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/societies/:path*',
    '/events/:path*',
    '/announcements/:path*',
    '/auth/:path*',
  ],
};