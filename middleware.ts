import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname === '/@vite/client') {
    // Silence spurious requests for Vite client in a Next.js dev server
    // by returning an empty 204 response instead of 404.
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api).*)'],
};