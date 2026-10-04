import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchDentalCoverage,
  submitDentalClaim,
  fetchClaimStatus,
  fetchDentalProviders,
} from '../services/dentalApi';
import styles from './DentalAssistancePage.module.css';

// ── Static snapshot for the hero coverage card ────────────
const PLAN_SNAPSHOT = {
  planName:            'Lincoln Dental Premier',
  annualMaximum:       2000,
  annualUsed:          1055,
  deductible:          50,
  deductibleMet:       50,
  preventiveUsed:      0,
  preventiveDollarMax: 500,
  expiringAmount:      275,
  expiringDays:        62,
};

const QUICK_LINKS = [
  {
    icon: '🤖',
    label: 'AI Coverage Assistant',
    desc: 'Chat with DentalBot to estimate costs, understand coverage, and find providers.',
    to: '/benefits/dental/ai-chat',
    highlight: true,
  },
  {
    icon: '📋',
    label: 'View / Compare Plans',
    desc:  'See your recommended care plan and year-over-year cost breakdown.',
    to:    '/benefits/dental/compare-plans',
  },
  {
    label: 'Add Qualifying Life Event',
    desc:  'Report a QLE to update your coverage outside open enrollment.',
    to:    '/life-event',
  },
  {
    label: 'Schedule a Service',
    desc:  'Book a cleaning, exam, or specialist appointment.',
    to:    '/benefits/dental/schedule',
  },
];

export default function DentalAssistancePage() {
  const s = PLAN_SNAPSHOT;

  const annualUsedPct     = Math.min(100, Math.round((s.annualUsed      / s.annualMaximum)       * 100));
  const deductiblePct     = Math.min(100, Math.round((s.deductibleMet   / s.deductible)          * 100));
  const preventiveUsedPct = Math.min(100, Math.round((s.preventiveUsed  / s.preventiveDollarMax)  * 100));
  const preventiveLeftPct = 100 - preventiveUsedPct;

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Your Dental Plan Coverage Overview</h1>
        <p className={styles.subheading}>
          {s.planName} — manage claims, coverage, and find in-network providers.
        </p>
      </header>

      {/* ── Hero grid: coverage snapshot + quick links ─── */}
      <div className={styles.heroGrid}>

        {/* LEFT — Coverage snapshot */}
        <section className={styles.coverageCard} aria-labelledby="coverage-heading">
          <h2 id="coverage-heading" className={styles.cardHeading}>
            Your Current Plan Coverage Details
          </h2>

          <div className={styles.barBlock}>
            <div className={styles.barLabelRow}>
              <span className={styles.barLabel}>Annual Maximum Used</span>
              <span className={styles.barValue}>
                ${s.annualUsed.toLocaleString()} <span className={styles.barOf}>of</span> ${s.annualMaximum.toLocaleString()}
              </span>
            </div>
            <div
              className={styles.barTrack}
              role="progressbar"
              aria-valuenow={annualUsedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Annual maximum: ${annualUsedPct}% used`}
            >
              <div
                className={`${styles.barFill} ${
                  annualUsedPct >= 80 ? styles.barDanger
                  : annualUsedPct >= 50 ? styles.barWarning
                  : styles.barGood
                }`}
                style={{ width: `${annualUsedPct}%` }}
              />
            </div>
            <p className={styles.barCaption}>
              ${(s.annualMaximum - s.annualUsed).toLocaleString()} remaining this plan year
            </p>
          </div>

          <div className={styles.barBlock}>
            <div className={styles.barLabelRow}>
              <span className={styles.barLabel}>Deductible Met</span>
              <span className={styles.barValue}>
                ${s.deductibleMet} <span className={styles.barOf}>of</span> ${s.deductible}
              </span>
            </div>
            <div
              className={styles.barTrack}
              role="progressbar"
              aria-valuenow={deductiblePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Deductible: ${deductiblePct}% met`}
            >
              <div
                className={`${styles.barFill} ${deductiblePct === 100 ? styles.barGood : styles.barWarning}`}
                style={{ width: `${deductiblePct}%` }}
              />
            </div>
            <p className={styles.barCaption}>
              {deductiblePct === 100
                ? '✓ Deductible fully met'
                : `$${s.deductible - s.deductibleMet} still needed`}
            </p>
          </div>

          <div className={styles.barBlock}>
            <div className={styles.barLabelRow}>
              <span className={styles.barLabel}>Preventive Services Still Available</span>
              <span className={styles.barValue}>
                {preventiveLeftPct}% <span className={styles.barOf}>remaining</span>
              </span>
            </div>
            <div
              className={styles.barTrack}
              role="progressbar"
              aria-valuenow={preventiveLeftPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Preventive services: ${preventiveLeftPct}% available`}
            >
              <div
                className={`${styles.barFill} ${styles.barGood}`}
                style={{ width: `${preventiveLeftPct}%` }}
              />
            </div>
            <p className={styles.barCaption}>
              Preventive care covered at 100% in-network — no cost to you
            </p>
          </div>

          <div className={styles.expiryAlert} role="status">
            <div className={styles.expiryLeft}>
              <span className={styles.expiryIcon} aria-hidden="true">⏳</span>
              <div>
                <p className={styles.expiryTitle}>Benefits expiring soon</p>
                <p className={styles.expiryBody}>
                  <strong>${s.expiringAmount}</strong> of benefits expire in{' '}
                  <strong>{s.expiringDays} days</strong>.
                </p>
              </div>
            </div>
            <Link to="/benefits/dental/compare-plans" className={styles.expiryBtn}>
              View care plan →
            </Link>
          </div>
        </section>

        {/* RIGHT — Quick links */}
        <aside className={styles.quickLinksCard} aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className={styles.cardHeading}>Quick Links</h2>
          <ul className={styles.quickList} role="list">
            {QUICK_LINKS.map((ql) => (
              <li key={ql.to}>
                <Link
                  to={ql.to}
                  className={`${styles.quickItem} ${ql.highlight ? styles.quickItemHighlight : ''}`}
                >
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
