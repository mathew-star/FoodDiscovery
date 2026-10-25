import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 });
}

export const config = {
  matcher: [
    '/((?!_next/|api/|hyderabad(?:/|$)|r/|p/|c/|u/|lists/|battles(?:/|$)|communities(?:/|$)|about$|guidelines$|offline$|login(?:/|$)|onboarding$|post/|rate/|saved$|notifications$|settings$|admin(?:/|$)|manifest\\.webmanifest$|robots\\.txt$|sitemap\\.xml$|sw\\.js$|icons/|icon\\.svg$|apple-icon\\.png$)[^/]+.*)',
  ],
};
