import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for protecting routes and handling authentication
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/", "/api"];

    // Check if current path is public
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route),
    );

    // Get session cookie (Better Auth uses 'better-auth.session_token' by default)
    const sessionToken = request.cookies.get("better-auth.session_token");

    // If trying to access protected route without session, redirect to login
    if (!isPublicRoute && !sessionToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If logged in and trying to access login page, let the page handle it
    // or we could redirect to a role-based dashboard if we had the role in a cookie.
    // For now, we'll allow it so the user can see their status or logout.
    if (pathname === "/login" && sessionToken) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
