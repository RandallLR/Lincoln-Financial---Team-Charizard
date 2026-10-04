import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchDentalCoverage,
  submitDentalClaim,
  fetchClaimStatus,
  fetchDentalProviders,
  fetchCarePlan,
} from '../services/dentalApi';
import styles from './DentalAssistancePage.module.css';

// ── Static snapshot for the hero coverage card ────────────
const PLAN_SNAPSHOT = {
  planName:            'Lincoln Dental Premier',
  annualMaximum:       2000,
  annualUsed:          1600,
  deductible:          50,
  deductibleMet:       50,
  preventiveUsed:      0,
  preventiveDollarMax: 500,
  expiringAmount:      400,
  expiringDays:        86,
};

const QUICK_LINKS = [
  {
    icon: null,
    label: 'View / Compare Plans',
    desc:  'Browse and compare available dental plan options.',
    to:    '/benefits/dental/compare-plans',
  },
  {
    icon: null,
    label: 'Add Qualifying Life Event',
    desc:  'Report a QLE to update your coverage outside open enrollment.',
    to:    '/life-event',
  },
  {
    icon: null,
    label: 'Schedule a Service',
    desc:  'Book a cleaning, exam, or specialist appointment.',
    to:    '/benefits/dental/schedule',
  },
];

const TABS = [
  { id: 'careplan',  label: 'My Care Plan'    },
  { id: 'coverage',  label: 'My Coverage'     },
  { id: 'claim',     label: 'Submit a Claim'  },
  { id: 'status',    label: 'Claim Status'    },
  { id: 'providers', label: 'Find a Provider' },
];

export default function DentalAssistancePage() {
  const [activeTab, setActiveTab] = useState('careplan');
  const s = PLAN_SNAPSHOT;

  const annualUsedPct     = Math.min(100, Math.round((s.annualUsed      / s.annualMaximum)      * 100));
  const deductiblePct     = Math.min(100, Math.round((s.deductibleMet   / s.deductible)         * 100));
  const preventiveUsedPct = Math.min(100, Math.round((s.preventiveUsed  / s.preventiveDollarMax) * 100));
  const preventiveLeftPct = 100 - preventiveUsedPct;

  return (
    <div className={styles.page}>

      {/* ── Page header ─────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>Dental Assistance</h1>
        <p className={styles.subheading}>
          {s.planName} — manage claims, coverage, and in-network providers.
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
            <div className={styles.barTrack} role="progressbar"
              aria-valuenow={annualUsedPct} aria-valuemin={0} aria-valuemax={100}
              aria-label={`Annual maximum: ${annualUsedPct}% used`}>
              <div
                className={`${styles.barFill} ${annualUsedPct >= 80 ? styles.barDanger : annualUsedPct >= 50 ? styles.barWarning : styles.barGood}`}
                style={{ width: `${annualUsedPct}%` }}
              />
            </div>
            <p className={styles.barCaption}>${(s.annualMaximum - s.annualUsed).toLocaleString()} remaining this plan year</p>
          </div>

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
              <div className={`${styles.barFill} ${styles.barGood}`} style={{ width: `${preventiveLeftPct}%` }} />
            </div>
            <p className={styles.barCaption}>Preventive care covered at 100% in-network — no cost to you</p>
          </div>

          <div className={styles.expiryAlert} role="status">
            <div className={styles.expiryLeft}>
              <span className={styles.expiryIcon} aria-hidden="true">⏳</span>
              <div>
                <p className={styles.expiryTitle}>Benefits expiring soon</p>
                <p className={styles.expiryBody}>
                  <strong>${s.expiringAmount}</strong> of benefits expire in <strong>{s.expiringDays} days</strong>.
                </p>
              </div>
            </div>
            <a href="/benefits/dental/schedule" className={styles.expiryBtn}>Book your cleaning →</a>
          </div>
        </section>

        {/* RIGHT — Quick links */}
        <aside className={styles.quickLinksCard} aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className={styles.cardHeading}>Quick Links</h2>
          <ul className={styles.quickList} role="list">
            {QUICK_LINKS.map((ql) => (
              <li key={ql.to}>
                <Link to={ql.to} className={styles.quickItem}>
                  {ql.icon && (
                    <span className={styles.quickIcon} aria-hidden="true">{ql.icon}</span>
                  )}
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

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className={styles.tabBar} role="tablist" aria-label="Dental portal sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ──────────────────────────────────── */}
      <div className={styles.panel}>
        {activeTab === 'careplan'  && <CarePlanPanel />}
        {activeTab === 'coverage'  && <CoveragePanel />}
        {activeTab === 'claim'     && <ClaimPanel />}
        {activeTab === 'status'    && <ClaimStatusPanel />}
        {activeTab === 'providers' && <ProvidersPanel />}
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MY CARE PLAN PANEL
   ══════════════════════════════════════════════════════════ */
function CarePlanPanel() {
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

  if (loading) {
    return (
      <section aria-labelledby="tab-careplan" className={styles.cpEmptyState}>
        <p className={styles.cpLoadingText}>Loading your care plan…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-labelledby="tab-careplan" className={styles.cpEmptyState}>
        <p className={styles.error} role="alert">{error}</p>
      </section>
    );
  }

  if (!data || !data.planYears?.length) {
    return (
      <section aria-labelledby="tab-careplan" className={styles.cpEmptyState}>
        <p className={styles.cpNoPlan}>No plan selected. If you'd like one, select one!</p>
      </section>
    );
  }

  const { planYears, comparison } = data;

  const URGENCY_CONFIG = {
    urgent:   { className: styles.cpUrgent },
    deferred: { className: styles.cpDeferred },
    routine:  { className: styles.cpRoutine },
  };

  return (
    <section aria-labelledby="tab-careplan">
      <div className={styles.cpHeader}>
        <h2 className={styles.cpMainTitle}>Your Recommended Care Plan</h2>
        <p className={styles.cpSubtitle}>
          Procedures are scheduled across plan years to stay under your{' '}
          <strong>${data.employee.annualMaximum.toLocaleString()}</strong> annual benefit
          maximum and reduce what you pay out-of-pocket.
        </p>
      </div>

      <div className={styles.cpLegend} role="list" aria-label="Status legend">
        <span className={styles.cpLegendItem} role="listitem">
          <span className={`${styles.cpLegendDot} ${styles.cpLegendDotUrgent}`} aria-hidden="true" />
          Urgent — do now
        </span>
        <span className={styles.cpLegendItem} role="listitem">
          <span className={`${styles.cpLegendDot} ${styles.cpLegendDotDeferred}`} aria-hidden="true" />
          Moved to next year
        </span>
        <span className={styles.cpLegendItem} role="listitem">
          <span className={`${styles.cpLegendDot} ${styles.cpLegendDotRoutine}`} aria-hidden="true" />
          Routine / Preventive
        </span>
      </div>

      <div className={styles.cpGrid}>
        <div className={styles.cpColumns}>
          {planYears.map((year, colIdx) => (
            <div key={year.year} className={styles.cpColumn}>
              <div className={styles.cpYearHeader}>
                <span className={styles.cpYearBadge} aria-hidden="true">{colIdx + 1}</span>
                <h3 className={styles.cpYearTitle}>{year.year} plan year</h3>
              </div>

              <div className={styles.cpProcedures} role="list" aria-label={`${year.year} procedures`}>
                {year.procedures.map((proc) => {
                  const urgency = URGENCY_CONFIG[proc.urgency] ?? URGENCY_CONFIG.routine;
                  return (
                    <div key={proc.id} role="listitem" className={`${styles.cpCard} ${urgency.className}`}>
                      <div className={styles.cpCardTop}>
                        <span className={styles.cpCardMonth}>{proc.month}</span>
                        <div className={styles.cpCardBody}>
                          <p className={styles.cpCardName}>{proc.name}</p>
                          {proc.urgencyLabel && <p className={styles.cpCardStatus}>{proc.urgencyLabel}</p>}
                          {proc.note        && <p className={styles.cpCardNote}>{proc.note}</p>}
                        </div>
                      </div>
                      <div className={styles.cpCardMeta}>
                        <span className={styles.cpCardCategory}>{proc.category}</span>
                        <span className={styles.cpCardCost}>
                          {proc.patientCost === 0 ? 'No cost to you' : `You pay ~$${proc.patientCost.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.cpMaxBar}>
                <div className={styles.cpMaxLabel}>
                  <span>Annual max used</span>
                  <span><strong>${year.annualMaxUsed.toLocaleString()}</strong> of ${year.annualMaxTotal.toLocaleString()}</span>
                </div>
                <div
                  className={styles.cpBarTrack}
                  role="progressbar"
                  aria-valuenow={year.annualMaxUsed}
                  aria-valuemin={0}
                  aria-valuemax={year.annualMaxTotal}
                  aria-label={`${year.year} annual benefit used`}
                >
                  <div
                    className={`${styles.cpBarFill} ${colIdx === 0 ? styles.cpBarFill2026 : styles.cpBarFill2027}`}
                    style={{ width: `${Math.min(100, (year.annualMaxUsed / year.annualMaxTotal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className={styles.cpSidebar} aria-label="Cost comparison">
          <h3 className={styles.cpSidebarTitle}>Cost Comparison</h3>
          <div className={styles.cpSidebarRow}>
            <span className={styles.cpSidebarLabel}>If all done in {planYears[0]?.year}</span>
            <span className={styles.cpSidebarAmount}>${comparison.allInCurrentYear.toLocaleString()}</span>
          </div>
          <div className={`${styles.cpSidebarRow} ${styles.cpSidebarRowRecommended}`}>
            <span className={styles.cpSidebarLabel}>Recommended plan</span>
            <span className={`${styles.cpSidebarAmount} ${styles.cpSidebarAmountHighlight}`}>
              ${comparison.recommended.toLocaleString()}
            </span>
          </div>
          <div className={styles.cpSavingsChip} role="status" aria-live="polite">
            You save <strong>${comparison.savings.toLocaleString()}</strong>
          </div>
          <a
            href="mailto:dentist@example.com?subject=My%20Lincoln%20Dental%20Care%20Plan"
            className={styles.cpShareLink}
            aria-label="Share this care plan with your dentist via email"
          >
            Share with my dentist →
          </a>
          <div className={styles.cpSidebarDivider} aria-hidden="true" />
          <p className={styles.cpSidebarNote}>
            Costs are estimates based on your current plan coverage. Actual amounts may vary by provider and treatment complexity.
          </p>
        </aside>
      </div>

      <p className={styles.cpDisclaimer}>
        <em>Urgent care is never delayed. Timing suggestions are for elective care only — confirm scheduling with your dentist.</em>
      </p>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   MY COVERAGE PANEL
   ══════════════════════════════════════════════════════════ */
function CoveragePanel() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleFetch() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchDentalCoverage();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <section aria-labelledby="tab-coverage" className={styles.cpEmptyState}>
        <p className={styles.cpSubtitle} style={{ marginBottom: '1rem' }}>
          Pull your full dental coverage details directly from the Lincoln Dental API.
        </p>
        <button className={styles.primaryBtn} onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching…' : 'Load My Coverage'}
        </button>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    );
  }

  // Coverage tiers with descriptions for clarity
  const tiers = [
    {
      label:   'Preventive',
      value:   data.preventiveCoverage,
      unit:    '%',
      desc:    'Cleanings, exams, X-rays',
      color:   '#2e9e6b',
    },
    {
      label:   'Basic Restorative',
      value:   data.basicRestorativeCoverage,
      unit:    '%',
      desc:    'Fillings, simple extractions',
      color:   '#E8843A',
    },
    {
      label:   'Major Restorative',
      value:   data.majorRestorativeCoverage,
      unit:    '%',
      desc:    'Crowns, bridges, dentures',
      color:   '#6B1237',
    },
    {
      label:   'Orthodontia',
      value:   data.orthodontiaCoverage,
      unit:    '%',
      desc:    `Braces & aligners — lifetime max $${data.orthodontiaLifetimeMax?.toLocaleString()}`,
      color:   '#1A8080',
    },
  ];

  return (
    <section aria-labelledby="tab-coverage">
      {/* Header row */}
      <div className={styles.covHeader}>
        <div>
          <h2 className={styles.cpMainTitle}>Coverage Summary</h2>
          <p className={styles.cpSubtitle}>
            Plan: <strong>{data.planName}</strong> &nbsp;·&nbsp;
            Annual max: <strong>${data.annualMaximum?.toLocaleString()}</strong> &nbsp;·&nbsp;
            Deductible: <strong>${data.deductible} individual / ${data.familyDeductible} family</strong> &nbsp;·&nbsp;
            In-network only: <strong>{data.inNetworkOnly ? 'Yes' : 'No'}</strong>
          </p>
        </div>
        <button className={styles.covRefreshBtn} onClick={handleFetch} disabled={loading} aria-label="Refresh coverage data">
          {loading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* Coverage tier bars */}
      <div className={styles.covTiersGrid}>
        {tiers.map((tier) => (
          <div key={tier.label} className={styles.covTierCard}>
            <div className={styles.covTierTop}>
              <span className={styles.covTierLabel}>{tier.label}</span>
              <span className={styles.covTierValue} style={{ color: tier.color }}>
                {tier.value}{tier.unit}
              </span>
            </div>
            <div
              className={styles.covBarTrack}
              role="progressbar"
              aria-valuenow={tier.value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${tier.label}: ${tier.value}% covered`}
            >
              <div
                className={styles.covBarFill}
                style={{ width: `${tier.value}%`, background: tier.color }}
              />
            </div>
            <p className={styles.covTierDesc}>{tier.desc}</p>
          </div>
        ))}
      </div>

      {/* Key figures row */}
      <div className={styles.covStatsRow}>
        <div className={styles.covStat}>
          <span className={styles.covStatNumber}>${data.annualMaximum?.toLocaleString()}</span>
          <span className={styles.covStatLabel}>Annual Maximum</span>
        </div>
        <div className={styles.covStat}>
          <span className={styles.covStatNumber}>${data.deductible}</span>
          <span className={styles.covStatLabel}>Individual Deductible</span>
        </div>
        <div className={styles.covStat}>
          <span className={styles.covStatNumber}>${data.familyDeductible}</span>
          <span className={styles.covStatLabel}>Family Deductible</span>
        </div>
        <div className={styles.covStat}>
          <span className={styles.covStatNumber}>${data.orthodontiaLifetimeMax?.toLocaleString()}</span>
          <span className={styles.covStatLabel}>Ortho Lifetime Max</span>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   SUBMIT CLAIM PANEL
   ══════════════════════════════════════════════════════════ */
function ClaimPanel() {
  const [form, setForm]       = useState({ providerName: '', serviceDate: '', procedureCode: '', amount: '', description: '' });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await submitDentalClaim(form);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="tab-claim">
      <p className={styles.panelIntro}>
        Submit a dental claim directly through the Lincoln Dental API. Track it under
        "Claim Status" once submitted.
      </p>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formRow}>
          <Field label="Provider Name"        name="providerName"  value={form.providerName}  onChange={handleChange} placeholder="Dr. Smith"   required />
          <Field label="Service Date"         name="serviceDate"   value={form.serviceDate}   onChange={handleChange} type="date"               required />
        </div>
        <div className={styles.formRow}>
          <Field label="Procedure Code (ADA)" name="procedureCode" value={form.procedureCode} onChange={handleChange} placeholder="D0120"       required />
          <Field label="Amount Billed ($)"    name="amount"        value={form.amount}        onChange={handleChange} type="number" placeholder="120.00" required />
        </div>
        <Field label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Routine cleaning and exam" />
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Claim'}
        </button>
      </form>
      {error  && <p className={styles.error} role="alert">{error}</p>}
      {result && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Claim Submitted</h3>
          <p>Claim ID: <strong>{result.claimId}</strong></p>
          <p>Status: <strong>{result.status}</strong></p>
          <p>Estimated processing: <strong>{result.estimatedProcessingDays} business days</strong></p>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   CLAIM STATUS PANEL
   ══════════════════════════════════════════════════════════ */
function ClaimStatusPanel() {
  const [claimId, setClaimId] = useState('');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleLookup(e) {
    e.preventDefault();
    if (!claimId.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetchClaimStatus(claimId.trim());
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="tab-status">
      <p className={styles.panelIntro}>
        Enter a claim ID to check its current status with the Lincoln Dental API.
      </p>
      <form onSubmit={handleLookup} className={styles.inlineForm}>
        <input
          className={styles.input}
          type="text"
          value={claimId}
          onChange={(e) => setClaimId(e.target.value)}
          placeholder="e.g. CLM-2026-00123"
          aria-label="Claim ID"
          required
        />
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Looking up…' : 'Check Status'}
        </button>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {data && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Claim {data.claimId}</h3>
          <dl className={styles.dl}>
            <dt>Status</dt>          <dd className={styles[`status_${data.status?.toLowerCase()}`]}>{data.status}</dd>
            <dt>Provider</dt>        <dd>{data.providerName}</dd>
            <dt>Service Date</dt>    <dd>{data.serviceDate}</dd>
            <dt>Amount Billed</dt>   <dd>${data.amountBilled?.toFixed(2)}</dd>
            <dt>Amount Approved</dt> <dd>${data.amountApproved?.toFixed(2)}</dd>
            <dt>Patient Owes</dt>    <dd>${data.patientResponsibility?.toFixed(2)}</dd>
            <dt>Explanation</dt>     <dd>{data.explanation}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   FIND A PROVIDER PANEL
   ══════════════════════════════════════════════════════════ */
function ProvidersPanel() {
  const [zip, setZip]             = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!zip.trim()) return;
    setLoading(true);
    setError('');
    setProviders([]);
    try {
      const res = await fetchDentalProviders(zip.trim());
      setProviders(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="tab-providers">
      <p className={styles.panelIntro}>
        Search for in-network Lincoln Dental Premier providers near you.
      </p>
      <form onSubmit={handleSearch} className={styles.inlineForm}>
        <input
          className={styles.input}
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="ZIP code"
          aria-label="ZIP code"
          maxLength={10}
          required
        />
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Searching…' : 'Search Providers'}
        </button>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {providers.length > 0 && (
        <ul className={styles.providerList} role="list">
          {providers.map((p) => (
            <li key={p.providerId} className={styles.providerCard}>
              <strong className={styles.providerName}>{p.name}</strong>
              <span className={styles.providerSpec}>{p.specialty}</span>
              <address className={styles.providerAddr}>{p.address}</address>
              <a href={`tel:${p.phone}`} className={styles.providerPhone}>{p.phone}</a>
              <span className={`${styles.networkBadge} ${p.accepting ? styles.accepting : styles.notAccepting}`}>
                {p.accepting ? 'Accepting patients' : 'Not accepting'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── Reusable form field ────────────────────────────────── */
function Field({ label, name, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>{label}{required && ' *'}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
        required={required}
        aria-required={required}
      />
    </div>
  );
}
