import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  // When a redirect URL isn't on Supabase's allowlist, email links fall back
  // to the Site URL root. Hand them to the confirm route instead of silently
  // dropping the code.
  const { pathname: requestPath, searchParams } = request.nextUrl;
  if (
    requestPath === "/" &&
    (searchParams.has("code") || searchParams.has("token_hash") || searchParams.has("error_code"))
  ) {
    const confirmUrl = request.nextUrl.clone();
    confirmUrl.pathname = "/auth/confirm";
    return NextResponse.redirect(confirmUrl);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // The proxy runs on every request, so throwing here would turn the whole
  // site into a 500. Skip the session refresh instead; code that actually
  // needs Supabase still fails loudly in lib/supabase.
  if (!url || !publishableKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; skipping Supabase session refresh.",
    );
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  // Convenience redirects only. Pages still check the user (and the admin
  // role) on the server themselves.
  if (!signedIn && PROTECTED_PATHS.some((path) => matchesPath(pathname, path))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    if (pathname !== "/reset-password/update") {
      loginUrl.searchParams.set("next", pathname);
    } else {
      loginUrl.searchParams.set("error", "reset_link_invalid");
    }
    return redirectWithCookies(loginUrl, response);
  }

  if (signedIn && GUEST_ONLY_PATHS.some((path) => matchesPath(pathname, path))) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return redirectWithCookies(dashboardUrl, response);
  }

  return response;
}

const PROTECTED_PATHS = ["/dashboard", "/admin", "/reset-password/update"];
const GUEST_ONLY_PATHS = ["/login", "/register"];

function matchesPath(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

// Keep any refreshed session cookies when redirecting.
function redirectWithCookies(url, response) {
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
