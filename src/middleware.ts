import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('accessToken')?.value

  const publicPaths = ['/', '/signup']

  const isStaticFile =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(.*)$/)

  if (isStaticFile) {
    return NextResponse.next()
  }

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}