import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BenefitsPage.module.css';

const BENEFIT_PLANS = [
  {
    category: 'Medical',
    icon: '🏥',
    plans: ['Lincoln PPO Gold', 'Lincoln PPO Silver', 'Lincoln HSA HDHP'],
    current: 'Lincoln PPO Gold',
  },
  {
    category: 'Dental',
    icon: '🦷',
    plans: ['Lincoln Dental Premier', 'Lincoln Dental Basic'],
    current: 'Lincoln Dental Premier',
    ctaTo: '/benefits/dental',
    ctaLabel: 'Manage Dental / File Claims',
  },
  {
    category: 'Vision',
    icon: '👁️',
    plans: ['Lincoln Vision Plus', 'Lincoln Vision Basic'],
    current: 'Lincoln Vision Plus',
  },
  {
    category: 'Life Insurance',
    icon: '🛡️',
    plans: ['1× Salary', '2× Salary', '3× Salary'],
    current: '2× Salary',
  },
  {
    category: '401(k) Retirement',
    icon: '💰',
    plans: ['Traditional 401(k)', 'Roth 401(k)'],
    current: 'Traditional 401(k) — 6% contribution',
  },
  {
    category: 'Flexible Spending',
    icon: '📋',
    plans: ['Healthcare FSA', 'Dependent Care FSA'],
    current: 'Healthcare FSA — $2,400 elected',
  },
];

/**
 * Benefits overview page.
 * Lists all benefit categories and deep-links into the Dental portal.
 */
export default function BenefitsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Benefits Overview</h1>
        <p className={styles.subheading}>
          Your current benefit elections for plan year 2026. Open enrollment runs{' '}
          <strong>Oct 15 – Nov 1</strong>.
        </p>
      </header>

      <div className={styles.grid}>
        {BENEFIT_PLANS.map(({ category, icon, current, ctaTo, ctaLabel }) => (
          <div key={category} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.icon} aria-hidden="true">{icon}</span>
              <h2 className={styles.cardTitle}>{category}</h2>
            </div>
            <p className={styles.currentPlan}>
              <span className={styles.planLabel}>Current plan:</span> {current}
            </p>
            {ctaTo && (
              <Link to={ctaTo} className={styles.ctaLink}>
                {ctaLabel} →
              </Link>
            )}
          </div>
        ))}
      </div>

      <section className={styles.note}>
        <h2 className={styles.noteTitle}>Need to make changes?</h2>
        <p>
          Benefit elections can only be changed during Open Enrollment or within 30 days of a
          qualifying life event (marriage, birth, adoption, etc.). Contact HR at{' '}
          <a href="mailto:benefits@lincolnfinancial.com">benefits@lincolnfinancial.com</a> for
          assistance.
        </p>
      </section>
    </div>
  );
}
