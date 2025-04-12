import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // Remove X-Frame-Options header that Vercel adds automatically
  response.headers.delete('X-Frame-Options');
  
  // Add Content-Security-Policy with frame-ancestors
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' http://localhost:8000 https://mecai.app https://novelvisionai.art;"
  );
  
  return response;
}

// Optionally configure to run on specific paths. If not specified, runs on all paths.
export const config = {
  matcher: '/:path*',
} 