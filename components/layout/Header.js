"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import styles from "./Header.module.css";

const links = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/online-access", label: "Online Access" },
  { href: "/contact", label: "Contact" },
];

/**
 * @param {{ account: React.ReactNode, mobileAccount: React.ReactNode }} props
 * Server-rendered, auth-dependent links (see HeaderAccount).
 */
export default function Header({ account, mobileAccount }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          Lou Fitness
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {/* usePathname() suspends on dynamic routes like /admin/courses/[id]
              under Cache Components; the fallback renders the same links
              without the active highlight. */}
          <Suspense fallback={<NavLinks pathname={null} />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>

        <div className={styles.actions}>
          {account}
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`container ${open ? styles.mobilePanelOpen : styles.mobilePanel}`}
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div onClick={() => setOpen(false)}>{mobileAccount}</div>
      </div>
    </header>
  );
}

function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }) {
  return links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className={`${styles.link} ${pathname === link.href ? styles.linkActive : ""}`}
    >
      {link.label}
    </Link>
  ));
}
