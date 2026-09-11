import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/patients",
  "/doctors",
  "/appointments",
  "/opd",
  "/ipd",
  "/laboratory",
  "/pharmacy",
  "/billing",
  "/reports",
  "/settings",
];

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname, origin } = request.nextUrl;
      const isLoginPage = pathname === "/login";
      const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isLoginPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", origin));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
