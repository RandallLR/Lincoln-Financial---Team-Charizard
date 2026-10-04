import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCarePlan } from '../services/dentalApi';
import styles from './ComparePlansPage.module.css';

const URGENCY_CONFIG = {
  urgent:   { className: 'cpUrgent' },
  deferred: { className: 'cpDeferred' },
  routine:  { className: 'cpRoutine' },
};

export default function ComparePlansPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchCarePlan()
      .then((result) => { if (!cancelled) setData(result); })
      .catch((e)     => { if (!cancelled) setError(e.message); })
      .finally(()    => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={styles.page}>

      {/* ── Breadcrumb ─────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/benefits/dental" className={styles.breadcrumbLink}>Dental Assistance</Link>
        <span className={styles.breadcrumbSep} aria-hidden="true"> / </span>
        <span className={styles.breadcrumbCurrent} aria-current="page">View &amp; Compare Plans</span>
      </nav>

      {/* ── Page header ─────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Your Recommended Care Plan</h1>
        <p className={styles.subheading}>
          Procedures are timed across plan years to keep your costs under the annual benefit
          maximum. Urgent care is never delayed — timing suggestions apply to elective work only.
        </p>
      </header>

      {/* ── Loading ─────────────────────────────────────── */}
      {loading && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>Loading your care plan…</p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────── */}
      {!loading && error && (
        <div className={styles.stateBox}>
          <p className={styles.errorText} role="alert">{error}</p>
        </div>
      )}

      {/* ── No plan ─────────────────────────────────────── */}
      {!loading && !error && (!data || !data.planYears?.length) && (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>No plan selected. If you'd like one, select one!</p>
        </div>
      )}

      {/* ── Plan content ────────────────────────────────── */}
      {!loading && !error && data?.planYears?.length > 0 && (
        <PlanContent data={data} />
      )}
    </div>
  );
}

/* ── Plan content (separated for clarity) ──────────────── */
function PlanContent({ data }) {
  const { planYears, comparison, employee } = data;
  const annualMax = employee?.annualMaximum ?? 2000;

  // Pull pre-computed comparison figures directly from mock —
  // these are the only values that differ meaningfully between scenarios.
  const {
    allInCurrentYear,
    allInCurrentYearCovered,
    allInCurrentYearOop,
    recommendedCovered,
    recommendedOop,
    savings,
  } = comparison;

  return (
    <>
      {/* Legend */}
      <div className={styles.legend} role="list" aria-label="Status legend">
        <span className={styles.legendItem} role="listitem">
          <span className={`${styles.legendDot} ${styles.legendDotUrgent}`} aria-hidden="true" />
          Urgent — do now
        </span>
        <span className={styles.legendItem} role="listitem">
          <span className={`${styles.legendDot} ${styles.legendDotDeferred}`} aria-hidden="true" />
          Moved to next year
        </span>
        <span className={styles.legendItem} role="listitem">
          <span className={`${styles.legendDot} ${styles.legendDotRoutine}`} aria-hidden="true" />
          Routine / Preventive
        </span>
      </div>

      {/* Main grid */}
      <div className={styles.mainGrid}>

        {/* Plan year columns */}
        <div className={styles.columns}>
          {planYears.map((year, colIdx) => {
            // Per-year covered / OOP totals for the year summary bar
            const yearOop      = year.procedures.reduce((s, p) => s + p.patientCost, 0);
            const yearEstimated = year.procedures.reduce((s, p) => s + p.estimatedCost, 0);
            const yearCovered  = yearEstimated - yearOop;

            return (
              <div key={year.year} className={styles.column}>

                {/* Year heading */}
                <div className={styles.yearHeader}>
                  <span className={styles.yearBadge} aria-hidden="true">{colIdx + 1}</span>
                  <h2 className={styles.yearTitle}>{year.year} plan year</h2>
                </div>

                {/* Procedure cards */}
                <div className={styles.procedures} role="list" aria-label={`${year.year} procedures`}>
                  {year.procedures.map((proc) => {
                    const urgencyKey  = URGENCY_CONFIG[proc.urgency]?.className ?? 'cpRoutine';
                    const planShare   = proc.estimatedCost - proc.patientCost;

                    return (
                      <div
                        key={proc.id}
                        role="listitem"
                        className={`${styles.card} ${styles[urgencyKey]}`}
                      >
                        {/* Top row: month + name + status */}
                        <div className={styles.cardTop}>
                          <span className={styles.cardMonth}>{proc.month}</span>
                          <div className={styles.cardBody}>
                            <p className={styles.cardName}>{proc.name}</p>
                            {proc.urgencyLabel && (
                              <p className={`${styles.cardStatus} ${styles[urgencyKey + 'Text']}`}>
                                {proc.urgencyLabel}
                              </p>
                            )}
                            {proc.note && (
                              <p className={styles.cardNote}>{proc.note}</p>
                            )}
                          </div>
                        </div>

                        {/* Coverage context strip */}
                        <div className={styles.cardCoverage}>
                          <div className={styles.cardCoverageRow}>
                            <span className={styles.cardCoverageLabel}>Est. procedure cost</span>
                            <span className={styles.cardCoverageVal}>${proc.estimatedCost.toLocaleString()}</span>
                          </div>
                          <div className={styles.cardCoverageRow}>
                            <span className={styles.cardCoverageLabel}>
                              Plan covers ({proc.coveredPercent}%)
                            </span>
                            <span className={`${styles.cardCoverageVal} ${styles.cardCoveredAmt}`}>
                              ${planShare.toLocaleString()}
                            </span>
                          </div>
                          <div className={styles.cardCoverageRow}>
                            <span className={styles.cardCoverageLabel}>Your out-of-pocket</span>
                            <span className={`${styles.cardCoverageVal} ${styles.cardOopAmt}`}>
                              {proc.patientCost === 0 ? 'No cost to you' : `$${proc.patientCost.toLocaleString()}`}
                            </span>
                          </div>
                        </div>

                        {/* Category pill */}
                        <div className={styles.cardMeta}>
                          <span className={styles.cardCategory}>{proc.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Year cost summary */}
                <div className={styles.yearSummary}>
                  <div className={styles.yearSummaryRow}>
                    <span className={styles.yearSummaryLabel}>Year total (estimated)</span>
                    <span className={styles.yearSummaryVal}>${yearEstimated.toLocaleString()}</span>
                  </div>
                  <div className={styles.yearSummaryRow}>
                    <span className={styles.yearSummaryLabel}>Plan covers</span>
                    <span className={`${styles.yearSummaryVal} ${styles.yearSummaryCovered}`}>${yearCovered.toLocaleString()}</span>
                  </div>
                  <div className={styles.yearSummaryRow}>
                    <span className={styles.yearSummaryLabel}>Your out-of-pocket</span>
                    <span className={`${styles.yearSummaryVal} ${styles.yearSummaryOop}`}>${yearOop.toLocaleString()}</span>
                  </div>
                </div>

                {/* Annual max bar */}
                <div className={styles.maxBar}>
                  <div className={styles.maxBarLabel}>
                    <span>Annual max used</span>
                    <span>
                      <strong>${year.annualMaxUsed.toLocaleString()}</strong>
                      {' '}of ${year.annualMaxTotal.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={styles.barTrack}
                    role="progressbar"
                    aria-valuenow={year.annualMaxUsed}
                    aria-valuemin={0}
                    aria-valuemax={year.annualMaxTotal}
                    aria-label={`${year.year} annual benefit used`}
                  >
                    <div
                      className={`${styles.barFill} ${colIdx === 0 ? styles.barFillA : styles.barFillB}`}
                      style={{
                        width: `${Math.min(100, (year.annualMaxUsed / year.annualMaxTotal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison sidebar — three stacked cards */}
        <aside className={styles.sidebar} aria-label="Cost comparison">
          <h3 className={styles.sidebarTitle}>Cost Comparison</h3>

          {/* Card 1 — All in current year */}
          <div className={styles.compCard}>
            <p className={styles.compCardLabel}>All done in {planYears[0]?.year}</p>
            <p className={`${styles.compCardAmount} ${styles.compCardAmountWarning}`}>${allInCurrentYear.toLocaleString()}</p>
            <div className={styles.compBreakdown}>
              <div className={styles.compBreakdownRow}>
                <span className={styles.compBreakdownLabel}>Plan covers (capped at ${annualMax.toLocaleString()} max)</span>
                <span className={`${styles.compBreakdownValue} ${styles.coveredValue}`}>
                  ${allInCurrentYearCovered.toLocaleString()}
                </span>
              </div>
              <div className={styles.compBreakdownRow}>
                <span className={styles.compBreakdownLabel}>Your out-of-pocket</span>
                <span className={`${styles.compBreakdownValue} ${styles.oopValue}`}>
                  ${allInCurrentYearOop.toLocaleString()}
                </span>
              </div>
            </div>
            <p className={styles.compCardDesc}>
              All procedures in one year exceed your ${annualMax.toLocaleString()} annual maximum.
              Once the cap is hit, every dollar above it comes out of your pocket.
            </p>
          </div>

          {/* Card 2 — Recommended plan */}
          <div className={`${styles.compCard} ${styles.compCardRecommended}`}>
            <p className={styles.compCardLabel}>Recommended plan</p>
            <p className={`${styles.compCardAmount} ${styles.compCardAmountAccent}`}>
              ${allInCurrentYear.toLocaleString()}
            </p>
            <div className={styles.compBreakdown}>
              <div className={styles.compBreakdownRow}>
                <span className={styles.compBreakdownLabel}>Plan covers (2 annual maxes)</span>
                <span className={`${styles.compBreakdownValue} ${styles.coveredValue}`}>
                  ${recommendedCovered.toLocaleString()}
                </span>
              </div>
              <div className={styles.compBreakdownRow}>
                <span className={styles.compBreakdownLabel}>Your out-of-pocket</span>
                <span className={`${styles.compBreakdownValue} ${styles.oopValue}`}>
                  ${recommendedOop.toLocaleString()}
                </span>
              </div>
            </div>
            <p className={styles.compCardDesc}>
              Splitting across two plan years unlocks a second ${annualMax.toLocaleString()} annual
              maximum. The plan covers its full share on every procedure — you pay ${savings.toLocaleString()} less.
            </p>
          </div>

          {/* Card 3 — Savings + share */}
          <div className={`${styles.compCard} ${styles.compCardSavings}`}>
            <div className={styles.savingsChip} role="status" aria-live="polite">
              You save <strong>${savings.toLocaleString()}</strong>
            </div>
            <a
              href="mailto:dentist@example.com?subject=My%20Lincoln%20Dental%20Care%20Plan"
              className={styles.shareLink}
              aria-label="Share this care plan with your dentist via email"
            >
              Share with my dentist →
            </a>
            <p className={styles.compCardNote}>
              Costs are estimates. Actual amounts may vary by provider and treatment complexity.
            </p>
          </div>
        </aside>
      </div>

      {/* Disclaimer */}
      <p className={styles.disclaimer}>
        <em>
          Urgent care is never delayed. Timing suggestions are for elective care only —
          confirm all scheduling with your dentist.
        </em>
      </p>
    </>
  );
}
