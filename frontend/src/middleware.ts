import { NextMiddleware, NextResponse } from "next/server";

import { AUTH_URI, DEFAULT_LOGIN_REDIRECT } from "./lib/constants";
import getServerUser from "./lib/getServerUser";

const authRoutes = Object.values(AUTH_URI);

export const middleware: NextMiddleware = async (req) => {
  const { nextUrl } = req;
  const user = await getServerUser();
  const isLogedin = !!user;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname as any);

  if (isAuthRoute) {
    if (isLogedin) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.nextUrl));
    }

    return NextResponse.next();
  }

  if (!isLogedin) {
    let callbackUrl = nextUrl.pathname;

    if (req.nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(new URL(`${AUTH_URI.signIn}?callback-url=${encodedUrl}`, nextUrl));
  }

  return NextResponse.next();
};

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
