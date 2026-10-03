import React from 'react';
import styles from './Footer.module.css';

/**
 * Site-wide footer shown on all protected pages.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <p className={styles.copy}>
          &copy; {year} Lincoln Financial Group. All rights reserved.
        </p>
        <nav className={styles.links} aria-label="Footer links">
          <a href="/privacy" className={styles.link}>Privacy Policy</a>
          <a href="/terms"   className={styles.link}>Terms of Use</a>
          <a href="/contact" className={styles.link}>Contact HR</a>
          <a href="/accessibility" className={styles.link}>Accessibility</a>
        </nav>
        <p className={styles.disclaimer}>
          This portal is for authorized Lincoln Financial Group employees only.
          Unauthorized access is strictly prohibited.
        </p>
      </div>
    </footer>
  );
}
