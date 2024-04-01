import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import {
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
} from "@/routes";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  //Do not do anything
  if(isApiAuthRoute) return

  //If the user is authenticated redirect
  if(isAuthRoute){
    if(isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return 
  }

  //Redirect to login page
  if(!isLoggedIn && !isPublicRoute){
    return NextResponse.redirect(new URL("/auth/login", nextUrl)) 
  }

  return
});

export const config = {
  //The paths where our middleware will be called
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
