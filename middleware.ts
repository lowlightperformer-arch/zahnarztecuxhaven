import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/ratgeber') || pathname.startsWith('/api/admin')) {
    const session = request.cookies.get('admin_session')?.value

    if (session !== 'authenticated') {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
