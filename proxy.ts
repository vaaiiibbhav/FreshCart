import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req : NextRequest, res : NextResponse){
  const { pathname } = req.nextUrl
  const publicRoutes = ["/api/auth","/login", "/register", "/verify", "favicon.ico","/_next"]
  console.log(pathname)
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  if(isPublicRoute){
    return NextResponse.next()
  }
  const token = await getToken({req,secret:process.env.AUTH_SECRET})
  console.log(token)
  if(!token){
    const loginURL = new URL("/login",req.url)
    loginURL.searchParams.set("callbackUrl",req.url)// redirects to page where we want to go after login
    return NextResponse.redirect(loginURL)
  }
  const role = token.role
  if(pathname.startsWith("/user") && role!=="user"){
    return NextResponse.redirect(new URL ("/unauthorized",req.url))
  }
  if(pathname.startsWith("/admin") && role!=="admin"){
    return NextResponse.redirect(new URL ("/unauthorized",req.url))
  }
  if(pathname.startsWith("/delivery") && role!=="delivery"){
    return NextResponse.redirect(new URL ("/unauthorized",req.url))
  }
  return NextResponse.next()

}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)"
}

// req -----> proxy(authenticate endpoint) -----> server(via NextResponse.next) -----> res

// we dont have to add proxy to the : login, register, verify as these are public routes
// whereas we have to add proxy to the : home page of the user, products, orders, etc. as these are private routes