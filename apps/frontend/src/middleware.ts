import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Routes that anyone can access (no auth required) — exact match
const PUBLIC_ROUTES = new Set([
  '/',
  '/landing',
  '/forbidden',
  '/coming-soon',
  '/terms',
  '/privacy',
]);

// Route prefixes that anyone can access
const PUBLIC_PREFIXES = [
  '/catalog',
  '/community',
  '/print-services',
  '/u/',
  '/become-artist',
  '/become-provider',
  '/providers',
  '/apply',
  '/about-us',
  '/_next',
  '/favicon',
  '/icons',
  '/images',
  '/logo',
  '/svg',
  '/api',
];

// Routes that require a specific role
// Key = route prefix, Value = allowed roles
const ROLE_GATED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/artist': ['ARTIST', 'ADMIN'],
  '/upload': ['ARTIST', 'ADMIN'],
  '/provider': ['PROVIDER', 'ADMIN'],
};

// Routes that require any authenticated user (any role is fine)
const AUTH_REQUIRED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/notifications',
  '/downloads',
  '/orders',
  '/cart',
  '/checkout',
  '/collections',
  '/saved',
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getRoleGate(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_GATED_ROUTES)) {
    if (pathname.startsWith(prefix)) return roles;
  }
  return null;
}

function isAuthRequired(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (isPublicPath(pathname)) {
    // Special case if authenticated and hitting '/', redirect to dashboard
    if (pathname === '/') {
      const token = request.cookies.get('3dex_session')?.value;
      if (token && JWT_SECRET) {
        try {
          const secret = new TextEncoder().encode(JWT_SECRET);
          await jwtVerify(token, secret);
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
          const res = NextResponse.next();
          res.cookies.delete('3dex_session');
          return res;
        }
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('3dex_session')?.value;

  // No token not logged in redirect to /landing
  if (!token) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  if (!JWT_SECRET) {
    // Can't verify without secret let client-side auth guard handle it
    return NextResponse.next();
  }

  let payload: { role?: string } = {};
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload: jwtPayload } = await jwtVerify(token, secret);
    payload = jwtPayload as { role?: string };
  } catch {
    // Invalid/expired token  treat as unauthenticated
    const res = NextResponse.redirect(new URL('/landing', request.url));
    res.cookies.delete('3dex_session');
    return res;
  }

  const userRole = payload.role;

  // Check role-gated routes
  const allowedRoles = getRoleGate(pathname);
  if (allowedRoles) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    return NextResponse.next();
  }

  // Check auth-required routes (any authenticated user is fine)
  if (isAuthRequired(pathname)) {
    return NextResponse.next();
  }

  // Anything else pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|css|js)$).*)'],
};
