import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.next();
  }

  if (!JWT_SECRET) {
    // Without the secret we cannot verify expiry; avoid redirect loops with stale cookies.
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch {
    const res = NextResponse.next();
    res.cookies.delete('token');
    return res;
  }
}

export const config = {
  matcher: ['/'],
};
