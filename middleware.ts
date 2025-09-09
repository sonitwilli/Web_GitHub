import { NextRequest, NextResponse } from 'next/server';

// Function để detect iPhone OS version
function detectIPhoneVersion(userAgent: string): number | null {
  if (userAgent.includes('iPhone OS')) {
    const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    if (match) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);

      // Tính version number (ví dụ: 16.0.0 -> 1600)
      const version = major * 100 + minor;
      return version;
    }
  }
  return null;
}

// Middleware function
export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const iphoneVersion = detectIPhoneVersion(userAgent);

  // Kiểm tra nếu là iPhone và version < 16
  if (iphoneVersion !== null && iphoneVersion < 1600) {
    // Thay vì redirect trực tiếp, chúng ta sẽ set một header để client biết
    const response = NextResponse.next();
    response.headers.set('x-ios-version-check', 'redirect-required');
    return response;
  }

  // Handle specific path redirects to /tv
  try {
    const url = request.nextUrl.clone();
    const pathname = url.pathname.replace(/\/+$/, '');

    // Redirect quick login aliases to /tv
    if (pathname === '/dangnhapnhanh' || pathname === '/dnn') {
      const dest = new URL('/tv', url.origin);
      return NextResponse.redirect(dest);
    }

    // Map of legacy/info paths to `/thong-tin/<slug>`
    const infoPaths = new Set([
      '/gioi-thieu',
      '/chinh-sach-thanh-toan',
      '/dieu-khoan-su-dung',
      '/chinh-sach-bao-mat',
      '/cam-ket-quyen-rieng-tu',
    ]);

    // Avoid redirect loop: if already under /thong-tin, don't redirect
    if (!pathname.startsWith('/thong-tin')) {
      if (infoPaths.has(pathname)) {
        const slug = pathname.replace(/^\//, '');
        const dest = new URL(`/thong-tin/${slug}`, url.origin);
        // Preserve query string
        dest.search = url.search;
        return NextResponse.redirect(dest);
      }
    }

  } catch {
  }

  // Nếu không phải iPhone hoặc version >= 16, tiếp tục xử lý request
  return NextResponse.next();
}

// Cấu hình middleware để chạy trên tất cả routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};