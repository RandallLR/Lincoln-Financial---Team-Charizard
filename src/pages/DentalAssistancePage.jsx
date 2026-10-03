import React from 'react';
import { Link } from 'react-router-dom';
import styles from './DentalAssistancePage.module.css';

// ── Mock coverage snapshot shown at page load ─────────────
// In production pull this from fetchDentalCoverage() on mount.
const PLAN_SNAPSHOT = {
  planName:              'Lincoln Dental Premier',
  annualMaximum:         2000,
  annualUsed:            1600,   // $1,600 of $2,000 used
  deductible:            50,
  deductibleMet:         50,     // fully met
  preventiveTotal:       100,    // 100 % covered — track dollar value
  preventiveUsed:        0,      // $0 of preventive used this year
  preventiveDollarMax:   500,    // approx dollar value of preventive benefit
  expiringAmount:        400,
  expiringDays:          86,
};

const QUICK_LINKS = [
  {
    icon: '📋',
    label: 'View / Compare Plans',
    desc: 'Browse and compare available dental plan options.',
    to: '/benefits/dental/compare-plans',
  },
  {
    icon: '📝',
    label: 'Add Qualifying Life Event',
    desc: 'Report a QLE to update your coverage outside open enrollment.',
    to: '/benefits/dental/qle',
  },
  {
    icon: '📅',
    label: 'Schedule a Service',
    desc: 'Book a cleaning, exam, or specialist appointment.',
    to: '/benefits/dental/schedule',
  },
];

export default function DentalAssistancePage() {
  const s = PLAN_SNAPSHOT;

  const annualUsedPct      = Math.min(100, Math.round((s.annualUsed      / s.annualMaximum)     * 100));
  const deductiblePct      = Math.min(100, Math.round((s.deductibleMet   / s.deductible)        * 100));
  const preventiveUsedPct  = Math.min(100, Math.round((s.preventiveUsed  / s.preventiveDollarMax) * 100));
  const preventiveLeftPct  = 100 - preventiveUsedPct;

  return (
    <div className={styles.page}>

      {/* ── Page title ──────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>🦷 Dental Assistance</h1>
        <p className={styles.subheading}>
          {s.planName} — manage claims, coverage, and in-network providers.
        </p>
      </header>

      {/* ── Two-column hero: Coverage Details + Quick Links */}
      <div className={styles.heroGrid}>

        {/* LEFT — Plan Coverage Details */}
        <section className={styles.coverageCard} aria-labelledby="coverage-heading">
          <h2 id="coverage-heading" className={styles.cardHeading}>
            Your Current Plan Coverage Details:
          </h2>

          {/* 1. Annual Maximum Used */}
          <div className={styles.barBlock}>
            <div className={styles.barLabelRow}>
              <span className={styles.barLabel}>Annual Maximum Used</span>
              <span className={styles.barValue}>
                ${s.annualUsed.toLocaleString()} <span className={styles.barOf}>of</span> ${s.annualMaximum.toLocaleString()}
              </span>
            </div>
            <div className={styles.barTrack} role="progressbar"
              aria-valuenow={annualUsedPct} aria-valuemin={0} aria-valuemax={100}
              aria-label={`Annual maximum: ${annualUsedPct}% used`}>
              <div
                className={`${styles.barFill} ${annualUsedPct >= 80 ? styles.barDanger : annualUsedPct >= 50 ? styles.barWarning : styles.barGood}`}
                style={{ width: `${annualUsedPct}%` }}
              />
            </div>
            <p className={styles.barCaption}>
              ${(s.annualMaximum - s.annualUsed).toLocaleString()} remaining this plan year
            </p>
          </div>

          {/* 2. Deductible Met */}
          <div className={styles.barBlock}>
            <div className={styles.barLabelRow}>
              <span className={styles.barLabel}>Deductible Met</span>
              <span className={styles.barValue}>
                ${s.deductibleMet} <span className={styles.barOf}>of</span> ${s.deductible}
              </span>
            </div>
            <div className={styles.barTrack} role="progressbar"
              aria-valuenow={deductiblePct} aria-valuemin={0} aria-valuemax={100}
              aria-label={`Deductible: ${deductiblePct}% met`}>
              <div
                className={`${styles.barFill} ${deductiblePct === 100 ? styles.barGood : styles.barWarning}`}
                style={{ width: `${deductiblePct}%` }}
              />
            </div>
            <p className={styles.barCaption}>
              {deductiblePct === 100 ? '✓ Deductible fully met' : `$${s.deductible - s.deductibleMet} still needed`}
            </p>
          </div>

          {/* 3. Preventive Services Still Available */}
          <div className={styles.barBlock}>
            <div className={styles.barLabelRow}>
              <span className={styles.barLabel}>Preventive Services Still Available</span>
              <span className={styles.barValue}>
                {preventiveLeftPct}% <span className={styles.barOf}>remaining</span>
              </span>
            </div>
            <div className={styles.barTrack} role="progressbar"
              aria-valuenow={preventiveLeftPct} aria-valuemin={0} aria-valuemax={100}
              aria-label={`Preventive services: ${preventiveLeftPct}% available`}>
              <div
                className={`${styles.barFill} ${styles.barGood}`}
                style={{ width: `${preventiveLeftPct}%` }}
              />
            </div>
            <p className={styles.barCaption}>
              Preventive care covered at 100% in-network — no cost to you
            </p>
          </div>

          {/* 4. Expiring benefits alert */}
          <div className={styles.expiryAlert} role="status">
            <div className={styles.expiryLeft}>
              <span className={styles.expiryIcon}>⏳</span>
              <div>
                <p className={styles.expiryTitle}>Benefits expiring soon</p>
                <p className={styles.expiryBody}>
                  <strong>${s.expiringAmount}</strong> of benefits expire in{' '}
                  <strong>{s.expiringDays} days</strong>.
                </p>
              </div>
            </div>
            <a href="/benefits/dental/schedule" className={styles.expiryBtn}>
              Book your cleaning →
            </a>
          </div>
        </section>

        {/* RIGHT — Quick Links */}
        <aside className={styles.quickLinksCard} aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className={styles.cardHeading}>Quick Links</h2>
          <ul className={styles.quickList} role="list">
            {QUICK_LINKS.map((ql) => (
              <li key={ql.to}>
                <Link to={ql.to} className={styles.quickItem}>
                  <span className={styles.quickIcon} aria-hidden="true">{ql.icon}</span>
                  <div className={styles.quickText}>
                    <span className={styles.quickLabel}>{ql.label}</span>
                    <span className={styles.quickDesc}>{ql.desc}</span>
                  </div>
                  <span className={styles.quickArrow} aria-hidden="true">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
