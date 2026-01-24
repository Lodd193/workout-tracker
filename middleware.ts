import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Explicitly allow PWA assets - these should always be accessible
  const publicAssets = [
    '/manifest.json',
    '/offline.html',
    '/sw.js',
    '/icon-192.png',
    '/icon-512.png'
  ]
  if (publicAssets.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow access to login, signup, and reset-password pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/reset-password')) {
    return NextResponse.next()
  }

  // For now, allow all other requests (we'll rely on client-side auth)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
