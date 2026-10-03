import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/benefits',  label: 'Benefits' },
  { to: '/profile',   label: 'My Profile' },
];

/**
 * Top navigation bar shown on all protected pages.
 * Highlights the active route and provides a sign-out button.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className={styles.header} role="banner">
      <div className={styles.brand}>
        {/* Lincoln Financial logo placeholder */}
        <span className={styles.logoMark} aria-hidden="true">LF</span>
        <span className={styles.brandName}>Lincoln Financial</span>
        <span className={styles.portalLabel}>Employee Portal</span>
      </div>

      {/* Hamburger for mobile */}
      <button
        className={styles.hamburger}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      <nav
        className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
        aria-label="Main navigation"
      >
        <ul className={styles.navList} role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.userArea}>
          {user && (
            <span className={styles.userName} aria-label="Logged in as">
              {user.name}
            </span>
          )}
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </header>
  );
}
