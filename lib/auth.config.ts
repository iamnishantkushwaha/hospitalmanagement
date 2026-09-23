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
  "/patient-registrations",
];
// Note: "/patient-app" is deliberately NOT protected here — it is the public
// entry point for the patient app and handles its own signed-in vs.
// signed-out rendering (see app/patient-app/page.tsx).

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    // Edge-safe: this only copies claims already embedded in the signed JWT
    // (set by the `jwt` callback in lib/auth.ts at sign-in time) onto
    // `session.user` — no bcrypt/db access needed, so it's fine to run here
    // in middleware. Without this, `auth.user.role` is undefined at the
    // edge and the role-based redirect below can't work.
    session: async ({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
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
        // Send patients straight to their own app instead of the staff
        // dashboard. Redirecting everyone to /dashboard meant a patient
        // hit a second redirect (dashboard layout -> /patient-app) on every
        // trip through /login — visible as a blank flash on browser back.
        const target = auth?.user?.role === "PATIENT" ? "/patient-app" : "/dashboard";
        return NextResponse.redirect(new URL(target, origin));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
