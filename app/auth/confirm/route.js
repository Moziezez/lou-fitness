import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/auth/redirect";

const OTP_TYPES = new Set(["signup", "email", "recovery", "invite", "email_change", "magiclink"]);

/**
 * Landing point for links in Supabase auth emails (sign-up confirmation,
 * password reset). Supports both link styles:
 * - `?token_hash=…&type=…` from the customised email templates (works in any
 *   browser), see supabase/README.md
 * - `?code=…` from Supabase's default templates (PKCE; same browser only)
 * Supabase reports failed links (expired, already used) as `?error_code=…`.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = safeRedirectPath(
    searchParams.get("next"),
    type === "recovery" ? "/reset-password/update" : "/dashboard",
  );
  const isRecovery = type === "recovery" || next.startsWith("/reset-password");
  const toLogin = (query) => NextResponse.redirect(`${origin}/login?${query}`);

  if (searchParams.has("error_code") || searchParams.has("error")) {
    return toLogin(`error=${isRecovery ? "reset_link_invalid" : "confirm_link_invalid"}`);
  }

  const supabase = await createClient();

  if (tokenHash && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return toLogin(`error=${isRecovery ? "reset_link_invalid" : "confirm_link_invalid"}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);

    // Supabase only issues a code after it has verified the link, so the
    // email is confirmed even when the exchange fails. That happens when the
    // link is opened in another browser or mail app than the one used to
    // register (the PKCE verifier cookie is missing there).
    console.warn("Auth code exchange failed", error.code ?? error.name, error.message);
    return toLogin(isRecovery ? "error=reset_link_other_browser" : "confirmed=1");
  }

  return toLogin(`error=${isRecovery ? "reset_link_invalid" : "confirm_link_invalid"}`);
}
