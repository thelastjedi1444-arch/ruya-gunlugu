import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if accessing admin routes
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('auth_token');

        if (!token) {
            // Redirect to login page if no token
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect logged in users away from login page
    if (pathname === '/login') {
        const token = request.cookies.get('auth_token');

        if (token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
