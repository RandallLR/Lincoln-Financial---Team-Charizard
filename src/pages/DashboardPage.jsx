import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardPage.module.css';

// ── SVG icon set ───────────────────────────────────────────
function Icon({ name, className }) {
  const cls = className || styles.iconMd;
  const paths = {
    arrow:    <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
    chevron:  <path d="m9 18 6-6-6-6" />,
    close:    <path d="m6 6 12 12M18 6 6 18" />,
    dental:   <path d="M12 3.5c-1.8 0-2.7-1-4.5-1C4.5 2.5 3 5.2 3 8c0 2.6 1.4 4 2.1 6.1.8 2.6.7 7.4 3.1 7.4 1.5 0 1.6-5.8 3.8-5.8s2.3 5.8 3.8 5.8c2.4 0 2.3-4.8 3.1-7.4C19.6 12 21 10.6 21 8c0-2.8-1.5-5.5-4.5-5.5-1.8 0-2.7 1-4.5 1Z" />,
    document: <><path d="M6 2.5h8l4 4V21.5H6z"/><path d="M14 2.5v5h4M9 12h6M9 16h6"/></>,
    heart:    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    profile:  <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    shield:   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM9 12l2 2 4-4" />,
  };
  return (
    <svg aria-hidden="true" className={cls} fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      {paths[name]}
    </svg>
  );
}

// ── Data ───────────────────────────────────────────────────
const QUICK_LINKS = [
  {
    to:    '/benefits',
    icon:  'heart',
    title: 'Benefits overview',
    desc:  'Review your health, dental, vision, and retirement coverage.',
    label: 'View benefits',
  },
  {
    to:    '/benefits/dental',
    icon:  'dental',
    title: 'Dental assistance',
    desc:  'Submit claims, check coverage, or chat with dental support.',
    label: 'Get assistance',
  },
  {
    to:    '/profile',
    icon:  'profile',
    title: 'My profile',
    desc:  'Keep your personal details and emergency contacts up to date.',
    label: 'Update profile',
  },
  {
    to:    '/life-event',
    icon:  'document',
    title: 'Life event',
    desc:  'Report a qualifying change and update your coverage.',
    label: 'Report event',
  },
];

const ANNOUNCEMENTS = [
  {
    id:   1,
    date: 'Sep 30, 2026',
    tag:  'Benefits',
    title: 'Open enrollment begins October 15',
    body:  'Compare your plan options and make elections by November 1.',
  },
  {
    id:   2,
    date: 'Sep 20, 2026',
    tag:  'New',
    title: 'The new Dental API is now live',
    body:  'Find in-network care and view claim details with the updated experience.',
  },
  {
    id:   3,
    date: 'Sep 10, 2026',
    tag:  'Notice',
    title: 'System maintenance – Oct 5',
    body:  'The portal will be unavailable 12–4 AM ET on October 5 for scheduled maintenance.',
  },
];

// ── Component ──────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? user?.name?.split(' ')[0] ?? 'Employee';

  const [noticeVisible, setNoticeVisible] = useState(true);
  const [toast, setToast]                 = useState('');

  function notify(msg) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  }

  return (
    <div className={styles.page}>

      {/* ── Hero banner ────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="welcome-heading">
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowLine} aria-hidden="true" />
            Employee dashboard
          </p>
          <h1 id="welcome-heading" className={styles.heroHeading}>
            Welcome back, {firstName}.
          </h1>
          <p className={styles.heroSub}>
            Here's a snapshot of your benefits, upcoming dates, and the things that may need your attention.
          </p>
          <div className={styles.heroBadges}>
            <span>
              Employee ID <strong>{user?.employeeId ?? '—'}</strong>
            </span>
            <span>
              Department <strong>{user?.department ?? '—'}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ── Enrollment notice ──────────────────────────────── */}
      {noticeVisible && (
        <div className={styles.notice} role="note">
          <span className={styles.noticeIcon} aria-hidden="true">
            <Icon name="calendar" className={styles.iconSm} />
          </span>
          <p className={styles.noticeText}>
            <strong>Open enrollment starts October 15.</strong>{' '}
            Review your current coverage before enrollment opens.
          </p>
          <button
            className={styles.noticeAction}
            onClick={() => notify('Opening enrollment checklist')}
          >
            Review checklist
          </button>
          <button
            className={styles.noticeDismiss}
            aria-label="Dismiss reminder"
            onClick={() => setNoticeVisible(false)}
          >
            <Icon name="close" className={styles.iconXs} />
          </button>
        </div>
      )}

      {/* ── Quick access ───────────────────────────────────── */}
      <section className={styles.section} aria-labelledby="quick-access-heading">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Quick access</p>
            <h2 id="quick-access-heading" className={styles.sectionHeading}>
              What would you like to do?
            </h2>
          </div>
        </div>
        <div className={styles.tileGrid}>
          {QUICK_LINKS.map(({ to, icon, title, desc, label }) => (
            <Link key={to} to={to} className={styles.tile} aria-label={title}>
              <span className={styles.tileIconWrap} aria-hidden="true">
                <Icon name={icon} className={styles.iconMd} />
              </span>
              <h3 className={styles.tileTitle}>{title}</h3>
              <p className={styles.tileDesc}>{desc}</p>
              <span className={styles.tileAction}>
                {label}
                <Icon name="arrow" className={styles.iconXs} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bottom two-column ──────────────────────────────── */}
      <div className={styles.bottomGrid}>

        {/* Announcements */}
        <section aria-labelledby="announcements-heading">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Latest updates</p>
              <h2 id="announcements-heading" className={styles.sectionHeading}>
                Announcements
              </h2>
            </div>
            <button className={styles.viewAllBtn} onClick={() => notify('All announcements opened')}>
              View all
            </button>
          </div>
          <div className={styles.annoList}>
            {ANNOUNCEMENTS.map((a, i) => (
              <div key={a.id} className={`${styles.annoItem} ${i > 0 ? styles.annoItemBorder : ''}`}>
                <span className={styles.annoBar} aria-hidden="true" />
                <div className={styles.annoBody}>
                  <div className={styles.annoMeta}>
                    <time className={styles.annoDate}>{a.date}</time>
                    <span className={styles.annoTag}>{a.tag}</span>
                  </div>
                  <h3 className={styles.annoTitle}>{a.title}</h3>
                  <p className={styles.annoCopy}>{a.body}</p>
                </div>
                <Icon name="chevron" className={`${styles.iconSm} ${styles.annoChevron}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Coverage card */}
        <aside aria-labelledby="coverage-heading">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>At a glance</p>
              <h2 id="coverage-heading" className={styles.sectionHeading}>
                Your coverage
              </h2>
            </div>
          </div>
          <div className={styles.coverageCard}>
            <div className={styles.coverageCardTop}>
              <span className={styles.coverageCardIconWrap} aria-hidden="true">
                <Icon name="shield" className={styles.iconMd} />
              </span>
              <span className={styles.coverageActiveBadge}>Active</span>
            </div>
            <h3 className={styles.coveragePlanName}>Benefits plan 2026</h3>
            <p className={styles.coveragePlanSub}>Coverage through December 31, 2026</p>
            <div className={styles.coverageItems}>
              <div className={styles.coverageItem}>
                <Icon name="heart" className={styles.coverageItemIcon} />
                <p className={styles.coverageItemLabel}>Medical</p>
                <p className={styles.coverageItemValue}>PPO Plus</p>
              </div>
              <div className={styles.coverageItem}>
                <Icon name="dental" className={styles.coverageItemIcon} />
                <p className={styles.coverageItemLabel}>Dental</p>
                <p className={styles.coverageItemValue}>Premier</p>
              </div>
            </div>
            <Link to="/benefits" className={styles.coverageViewBtn}>
              View coverage details
              <Icon name="arrow" className={`${styles.iconSm} ${styles.coverageViewBtnIcon}`} />
            </Link>
          </div>
        </aside>
      </div>

      {/* ── Toast ──────────────────────────────────────────── */}
      <div
        role="status"
        aria-live="polite"
        className={`${styles.toast} ${toast ? styles.toastVisible : ''}`}
      >
        {toast}
      </div>
    </div>
  );
}
