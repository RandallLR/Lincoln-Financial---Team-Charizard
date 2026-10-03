import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

/**
 * 404 catch-all page rendered for any unmatched route.
 */
export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.code} aria-hidden="true">404</span>
        <h1 className={styles.heading}>Page Not Found</h1>
        <p className={styles.body}>
          The page you're looking for doesn't exist or may have moved. If you
          believe this is an error, contact IT support.
        </p>
        <div className={styles.actions}>
          <Link to="/dashboard" className={styles.homeBtn}>
            Back to Dashboard
          </Link>
          <a
            href="mailto:itsupport@lincolnfinancial.com"
            className={styles.contactLink}
          >
            Contact IT Support
          </a>
        </div>
      </div>
    </div>
  );
}
