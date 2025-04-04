import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Define route groups
const authRoutes = ["/login", "/signup", "/reset-password"];
const protectedRoutes = ["/chat", "/profile", "/settings", "/files"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get Firebase auth session cookie
  const session = cookies().get("firebase-auth-token")?.value;

  // Check if user is authenticated
  const isAuthenticated = !!session;

  // Check if the current route is an auth route (signin, signup, reset-password)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current route is a protected route (chat, profile, settings)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Case 1: User is authenticated but trying to access auth routes
  // Redirect to home or dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Case 2: User is not authenticated but trying to access protected routes
  // Redirect to signin
  if (!isAuthenticated && isProtectedRoute) {
    // Store the URL they were trying to access for redirect after login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all auth routes
    "/login/:path*",
    "/signup/:path*",
    "/reset-password/:path*",
    // Apply to all protected routes
    "/chat/:path*",
    "/profile/:path*",
    "/settings/:path*",
    // Include homepage for redirection purposes
    "/",
  ],
};
