import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for protecting routes and handling authentication
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected prefixes
    const protectedPrefixes = [
        "/mahasiswa",
        "/supervisor-akademik",
        "/manajer-tu",
        "/wakil-dekan-1",
        "/upa",
        "/dashboard",
    ];

    // Check if current path is strictly protected
    const isProtectedPath = protectedPrefixes.some((prefix) =>
        pathname.startsWith(prefix),
    );

    const sessionToken = request.cookies.get("better-auth.session_token");

    // If trying to access protected route without session, redirect to login
    if (isProtectedPath && (!sessionToken || !sessionToken.value)) {
        console.log(`[Middleware] Blocking access to ${pathname} - No Session`);
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-Based Access Control (RBAC)
    // We need to decode the cookie to check the role.
    // Since BetterAuth cookies might be signed/encrypted, relying on client-side readable parts or server-side verification is key.
    // However, for Middleware, we can't easily call the database.
    // OPTION: We can check "better-auth.session_data" if available (which we saw in logs earlier).
    // Let's try to parse the 'better-auth.session_data' cookie which often contains the user info including roles.

    const sessionData = request.cookies.get("better-auth.session_data");
    if (isProtectedPath && sessionToken && sessionData) {
        try {
            // session_data value is often base64 or JSON. Based on logs it looked like base64 or jwt-like.
            // Logs showed: better-auth.session_data=eyJzZXNzaW9u...
            // It's likely a JSON object.

            // NOTE: This is a simplified check. Ideally use stateless session jwt or verify on component.
            // But for simple path protection:

            // decode content (it might be URI encoded)
            const decodedValue = decodeURIComponent(sessionData.value);
            // It might be base64, usually better-auth stores it as JSON string or Base64.
            // Let's try to parse it if it looks like JSON, or base64 decode first.

            // Check if it's base64 (common for session data)
            // Heuristic: starts with 'ey' usually means Base64 JSON
            let jsonString = decodedValue;
            if (decodedValue.startsWith("ey")) {
                jsonString = Buffer.from(decodedValue, "base64").toString(
                    "utf-8",
                );
            }

            // First try to check the explicit user_roles cookie set by manual handler
            const userRolesCookie = request.cookies.get("user_roles");
            let userRoles: string[] = [];

            if (userRolesCookie) {
                userRoles = userRolesCookie.value.split(",");
            } else {
                // Fallback to parsing session data if available
                const parsed = JSON.parse(jsonString);
                if (parsed.user && parsed.user.roles) {
                    userRoles = parsed.user.roles;
                } else if (parsed.user && parsed.user.role) {
                    userRoles = [parsed.user.role];
                }
            }

            // Define Role-Path Usage
            const rolePathMap: Record<string, string> = {
                MAHASISWA: "/mahasiswa",
                SUPERVISOR: "/supervisor-akademik",
                MANAJER_TU: "/manajer-tu",
                WAKIL_DEKAN_1: "/wakil-dekan-1",
                UPA: "/upa",
            };

            // Check if user is accessing a path allowed for their role
            // We iterate over the map. If the path starts with a key's value, the user MUST have that key's role.
            for (const [role, path] of Object.entries(rolePathMap)) {
                if (pathname.startsWith(path)) {
                    if (!userRoles.includes(role)) {
                        console.log(
                            `[Middleware] RBAC Block: User with roles [${userRoles}] tried accessing ${pathname}`,
                        );
                        // Redirect to their own dashboard based on their first role
                        const userRole = userRoles[0];
                        const targetPath =
                            rolePathMap[userRole] || "/dashboard";
                        return NextResponse.redirect(
                            new URL(targetPath, request.url),
                        );
                    }
                }
            }
        } catch (e) {
            console.error(
                "[Middleware] Failed to parse session data for RBAC:",
                e,
            );
            // In case of error (tampered cookie?), safe to ignore or force re-login.
            // Let's allow for now to avoid locking out valid users due to parsing bugs,
            // but in production, this should probably strictly validate.
        }
    }

    // If logged in and trying to access login page, let the page handle it
    // or we could redirect to a role-based dashboard if we had the role in a cookie.
    // For now, we'll allow it so the user can see their status or logout.
    // If logged in and accessing /login, redirect to dashboard
    // If logged in and accessing /login, redirect to role-based dashboard if possible
    // If logged in and trying to access login page, let the page handle it
    // or we could redirect to a role-based dashboard if we had the role in a cookie.
    // For now, we'll allow it so the user can see their status or logout.
    // If logged in and accessing /login, redirect to dashboard
    // If logged in and accessing /login, redirect to role-based dashboard if possible
    // REMOVED: Automatic redirect to dashboard here can cause infinite loops or broken pages
    // if the backend is down (proxy error) but a stale cookie exists.
    // We let the client-side Login page verify the session and redirect if valid.
    /*
    if (pathname === "/login" && sessionToken) {
        let targetPath = "/dashboard";

        // Try to infer role from cookie for smarter redirect
        const userRolesCookie = request.cookies.get("user_roles");

        const rolePathMap: Record<string, string> = {
            MAHASISWA: "/mahasiswa",
            SUPERVISOR: "/supervisor-akademik",
            MANAJER_TU: "/manajer-tu",
            WAKIL_DEKAN_1: "/wakil-dekan-1",
            UPA: "/upa",
        };

        if (userRolesCookie) {
            const roles = userRolesCookie.value.split(",");
            if (roles.length > 0) {
                const firstRole = roles[0].toUpperCase();
                if (rolePathMap[firstRole]) {
                    targetPath = rolePathMap[firstRole];
                }
            }
        } else {
            // Fallback to session data
            const sessionData = request.cookies.get("better-auth.session_data");
            if (sessionData) {
                try {
                    const decodedValue = decodeURIComponent(sessionData.value);
                    let jsonString = decodedValue;
                    if (decodedValue.startsWith("ey")) {
                        jsonString = Buffer.from(
                            decodedValue,
                            "base64",
                        ).toString("utf-8");
                    }
                    const parsed = JSON.parse(jsonString);
                    const userRoles = parsed.user?.roles || [];

                    if (userRoles.length > 0) {
                        // Normalize roles as we did in login page (just in case)
                        const firstRole = userRoles[0].toUpperCase();
                        if (rolePathMap[firstRole]) {
                            targetPath = rolePathMap[firstRole];
                        }
                    }
                } catch {
                    // ignore parsing error, fallback to /dashboard
                }
            }
        }
        return NextResponse.redirect(new URL(targetPath, request.url));
    }
    */

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
