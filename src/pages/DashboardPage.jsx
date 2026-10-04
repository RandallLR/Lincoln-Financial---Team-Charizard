import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

const QUICK_LINKS = [
  {
    to: '/benefits',
    icon: '🏥',
    title: 'Benefits Overview',
    desc: 'Review your health, dental, vision, and retirement benefits.',
  },
  {
    to: '/benefits/dental',
    icon: '🦷',
    title: 'Dental Assistance',
    desc: 'Submit dental claims, check coverage, and interact with the Dental API.',
  },
  {
    to: '/profile',
    icon: '👤',
    title: 'My Profile',
    desc: 'Update personal information, dependents, and emergency contacts.',
  },
  {
    to: '/life-event',
    icon: '📋',
    title: 'Report a Life Event',
    desc: 'Marriage, birth, or adoption? Add a family member to your dental plan.',
  },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    date: 'Sep 30, 2026',
    title: 'Open Enrollment Period Begins Oct 15',
    body: 'Annual open enrollment runs October 15 – November 1. Review plan options and make your elections in the Benefits section.',
  },
  {
    id: 2,
    date: 'Sep 20, 2026',
    title: 'New Dental API Now Live',
    body: 'Employees can now submit dental pre-authorization requests and track claims in real time via the Dental Assistance portal.',
  },
  {
    id: 3,
    date: 'Sep 10, 2026',
    title: 'System Maintenance – Oct 5',
    body: 'The employee portal will be unavailable from 12:00 AM – 4:00 AM ET on October 5 for scheduled maintenance.',
  },
];

/**
 * Main landing page after login.
 * Shows a personalized welcome, quick-access tiles, and announcements.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      {/* Welcome banner */}
      <section className={styles.welcome} aria-labelledby="welcome-heading">
        <div>
          <h1 id="welcome-heading" className={styles.heading}>
            Welcome back, {user?.name ?? 'Employee'}
          </h1>
          <p className={styles.subheading}>
            Employee ID: <strong>{user?.employeeId ?? '—'}</strong>
            &nbsp;·&nbsp;Department: <strong>{user?.department ?? '—'}</strong>
          </p>
        </div>
      </section>

      {/* Quick access tiles */}
      <section className={styles.section} aria-labelledby="quick-access-heading">
        <h2 id="quick-access-heading" className={styles.sectionTitle}>
          Quick Access
        </h2>
        <div className={styles.tileGrid}>
          {QUICK_LINKS.map(({ to, icon, title, desc }) => (
            <Link key={to} to={to} className={styles.tile} aria-label={title}>
              <span className={styles.tileIcon} aria-hidden="true">{icon}</span>
              <h3 className={styles.tileTitle}>{title}</h3>
              <p className={styles.tileDesc}>{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className={styles.section} aria-labelledby="announcements-heading">
        <h2 id="announcements-heading" className={styles.sectionTitle}>
          Announcements
        </h2>
        <ul className={styles.announcements} role="list">
          {ANNOUNCEMENTS.map((a) => (
            <li key={a.id} className={styles.announcement}>
              <time className={styles.annoDate}>{a.date}</time>
              <h3 className={styles.annoTitle}>{a.title}</h3>
              <p className={styles.annoBody}>{a.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
