import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './Layout.module.css';

/**
 * Shell layout wrapping all protected pages.
 * React Router renders child pages into <Outlet />.
 */
export default function Layout() {
  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
