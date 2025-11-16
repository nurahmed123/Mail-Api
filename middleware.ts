import { NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/setup', '/settings', '/api-docs', '/api-playground']
const authPages = ['/login', '/signup']

export async function middleware(req: Request) {
  const url = new URL(req.url)
  const cookie = (req.headers as any).get?.('cookie') || (req as any).headers.get('cookie') || ''
  const hasSession = cookie.includes('mailapi_session=')

  if (authPages.some(p => url.pathname.startsWith(p))) {
    if (hasSession) return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  if (protectedPaths.some(p => url.pathname.startsWith(p))) {
    if (!hasSession) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*', '/setup/:path*', '/settings/:path*', '/api-docs', '/api-playground']
}
