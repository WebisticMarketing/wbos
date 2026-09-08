// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";
import { getRequiredEnv } from "@/lib/env";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

const AUTH_CACHE_TTL_MS = 60_000;
const authCache = new Map<string, { expiresAt: number }>();

// ============================================================
// MAIN PROXY FUNCTION
// ============================================================
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============================================================
  // STEP 0: Redirect /wbos/sadaat to the user's slug
  // ============================================================
  if (pathname.startsWith("/wbos/sadaat")) {
    const token = request.cookies.get("wbos_token")?.value;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const slug = payload.slug;
        if (slug && slug !== "sadaat" && !pathname.startsWith(`/wbos/${slug}`)) {
          const remainingPath = pathname.replace(/^\/wbos\/sadaat/, "");
          const newUrl = new URL(`/wbos/${slug}${remainingPath}`, request.url);
          newUrl.search = request.nextUrl.search;
          return NextResponse.redirect(newUrl);
        }
      } catch {
        // Ignore invalid tokens in the redirect check; handled below
      }
    }
  }

  // ============================================================
  // 1. ALWAYS ALLOW THESE PATHS (NO AUTH, NO REDIRECT)
  // ============================================================
  const alwaysAllow = [
    "/wbos/register",
    "/wbos/login",
    "/wbos/forgot-password",
    "/wbos/reset-password",
    "/wbos/manifest.json",
    "/wbos/sw.js",
    "/wbos/workbox-",
    "/wbos/icons/",
    "/wbos/api/invitations/validate",
    "/wbos/api/invitations/accept",
  ];

  for (const allowed of alwaysAllow) {
    if (pathname.startsWith(allowed)) {
      const response = NextResponse.next();
      response.headers.set("x-is-wbos", "true");
      return response;
    }
  }

  // Allow any /wbos/api/ route (just in case)
  if (pathname.startsWith("/wbos/api/")) {
    const response = NextResponse.next();
    response.headers.set("x-is-wbos", "true");
    return response;
  }

  // ============================================================
  // 2. SUBDOMAIN REWRITING (e.g., wbos.example.com)
  // ============================================================
  const host = request.headers.get("host") || "";
  const isWbosSubdomain = host.startsWith("wbos.");

  if (isWbosSubdomain) {
    const rewrittenPath = `/wbos${pathname}`;

    for (const allowed of alwaysAllow) {
      if (rewrittenPath.startsWith(allowed)) {
        const rewrittenUrl = request.nextUrl.clone();
        rewrittenUrl.pathname = rewrittenPath;
        const response = NextResponse.rewrite(rewrittenUrl);
        response.headers.set("x-is-wbos", "true");
        return response;
      }
    }

    const authResult = await checkAuth(request, rewrittenPath);
    if (authResult) return authResult;

    const rewrittenUrl = request.nextUrl.clone();
    rewrittenUrl.pathname = rewrittenPath;
    const response = NextResponse.rewrite(rewrittenUrl);
    response.headers.set("x-is-wbos", "true");
    return response;
  }

  // ============================================================
  // 3. PROTECTED /wbos PATHS (auth required)
  // ============================================================
  if (pathname.startsWith("/wbos")) {
    const authResult = await checkAuth(request, pathname);
    if (authResult) return authResult;

    const response = NextResponse.next();
    response.headers.set("x-is-wbos", "true");
    return response;
  }

  // ============================================================
  // 4. EVERYTHING ELSE – pass through
  // ============================================================
  return NextResponse.next();
}

// ============================================================
// 🔐 AUTH CHECK – ONLY CALLED FOR PROTECTED PATHS
// ============================================================
function redirectToLogin(request: NextRequest, pathname: string, options?: { error?: string; returnUrl?: boolean }) {
  const loginUrl = new URL("/wbos/login", request.url);
  if (options?.error) loginUrl.searchParams.set("error", options.error);
  if (options?.returnUrl && pathname && pathname !== "/wbos/login") {
    loginUrl.searchParams.set("returnUrl", pathname);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("wbos_token");
  return response;
}

async function checkAuth(request: NextRequest, pathname: string): Promise<NextResponse | null> {
  const token = request.cookies.get("wbos_token")?.value;

  if (!token) {
    return redirectToLogin(request, pathname, { returnUrl: true });
  }

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return redirectToLogin(request, pathname);
  }

  // Short-circuit if the user was verified within the last TTL window
  const cached = authCache.get(payload.userId);
  if (cached && cached.expiresAt > Date.now()) {
    return null;
  }

  try {
    const user = await prisma.wbosUser.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        status: true,
        business: { select: { status: true } },
      },
    });

    if (!user || user.status !== "active") {
      return redirectToLogin(request, pathname);
    }

    if (user.business?.status !== "active") {
      return redirectToLogin(request, pathname, { error: "suspended" });
    }

    authCache.set(payload.userId, { expiresAt: Date.now() + AUTH_CACHE_TTL_MS });
    return null;
  } catch {
    return redirectToLogin(request, pathname);
  }
}

// ============================================================
// MATCHER CONFIG – runs on all routes except static assets
// ============================================================
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};