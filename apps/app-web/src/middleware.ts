import { type NextRequest, NextResponse } from "next/server";

/**
 * Mintlify renders root-relative links (e.g. `/introduction`). When docs are
 * proxied at `/docs`, those clicks would leave the docs shell. Redirect them
 * back under `/docs` unless they match a marketing route.
 */
const MARKETING_ROUTES = new Set(["/"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    MARKETING_ROUTES.has(pathname) ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/mintlify-assets") ||
    pathname.startsWith("/_mintlify") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/docs${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
