import Link from "next/link";
import Button from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Auth-dependent header links. A Server Component rendered behind Suspense,
 * so it re-renders after the sign-in/sign-out Server Actions redirect.
 * @param {{ variant: "desktop" | "mobile" }} props
 */
export default async function HeaderAccount({ variant }) {
  const user = await getCurrentUser();

  if (variant === "mobile") {
    return user ? (
      <Link href="/dashboard">My account</Link>
    ) : (
      <Link href="/login">Sign in</Link>
    );
  }

  if (user) {
    return (
      <Button href="/dashboard" variant="primary">
        My account
      </Button>
    );
  }

  return <HeaderAccountSignedOut />;
}

export function HeaderAccountSignedOut() {
  return (
    <>
      <Button href="/login" variant="ghost" className="hide-mobile-cta">
        Sign in
      </Button>
      <Button href="/register" variant="primary">
        Get started
      </Button>
    </>
  );
}
