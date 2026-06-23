import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strictly ignore NextAuth API endpoints immediately
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const publicRoutes = ["/login", "/register", "/verify", "favicon.ico", "/_next"]
  console.log(pathname)
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Parse session cookies accurately using the new Next.js 16 headers paradigm
  const isSecure = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https"
  const token = await getToken({
    req: {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: Object.fromEntries(
        request.cookies.getAll().map((c) => [c.name, c.value])
      ),
    } as unknown as NextRequest,
    secret: process.env.AUTH_SECRET,
    secureCookie: isSecure,
  })

  console.log(token)

  // Ensure `/api/orders` allows both admin and cook roles
  if (pathname.startsWith("/api/orders")) {
    const role = token?.role
    if (role !== "admin" && role !== "cook") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginURL = new URL("/login", request.url)
    loginURL.searchParams.set("callbackUrl", request.url) // redirects to page where we want to go after login
    return NextResponse.redirect(loginURL)
  }
  const role = token.role
  if (pathname.startsWith("/user") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  if (pathname.startsWith("/cook") && role !== "cook") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  return NextResponse.next()
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/orders(.*)"
  ]
}

// req -----> proxy(authenticate endpoint) -----> server(via NextResponse.next) -----> res

// we dont have to add proxy to the : login, register, verify as these are public routes
// whereas we have to add proxy to the : home page of the user, products, orders, etc. as these are private routes