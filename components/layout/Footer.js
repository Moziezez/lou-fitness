import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>Lou Fitness</p>
          <p className={styles.blurb}>
            Personal coaching with Lou Patterson — Kingston, Jamaica.
            Start your weekly fitness routine and get in shape with a smile.
          </p>
        </div>

        <div className={styles.grid}>
          <div>
            <p className={styles.colTitle}>Explore</p>
            <ul className={styles.list}>
              <li>
                <Link href="/courses">Courses</Link>
              </li>
              <li>
                <Link href="/live-coaching">Live coaching</Link>
              </li>
              <li>
                <Link href="/about">About Lou</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.colTitle}>Legal (placeholders)</p>
            <ul className={styles.list}>
              <li>
                <Link href="/legal/imprint">Imprint</Link>
              </li>
              <li>
                <Link href="/legal/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/legal/withdrawal">Withdrawal</Link>
              </li>
              <li>
                <Link href="/legal/terms">Terms</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>Example content for development · not legal advice</span>
        <span>© 2026 Lou Fitness (sample)</span>
      </div>
    </footer>
  );
}
