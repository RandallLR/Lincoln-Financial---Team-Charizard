import React, { useState } from 'react';
import {
  fetchDentalCoverage,
  submitDentalClaim,
  fetchClaimStatus,
  fetchDentalProviders,
  fetchCarePlan,
} from '../services/dentalApi';
import styles from './DentalAssistancePage.module.css';

const TABS = [
  { id: 'careplan',   label: 'My Care Plan'       },
  { id: 'coverage',   label: 'My Coverage'        },
  { id: 'claim',      label: 'Submit a Claim'     },
  { id: 'status',     label: 'Claim Status'       },
  { id: 'providers',  label: 'Find a Provider'    },
];

/**
 * Dental Assistance page — the primary interface to the Dental API.
 * Each tab dispatches a different API endpoint.
 */
export default function DentalAssistancePage() {
  const [activeTab, setActiveTab] = useState('careplan');

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.heading}>🦷 Dental Assistance</h1>
        <p className={styles.subheading}>
          Manage your Lincoln Dental Premier plan — file claims, check coverage, and find
          in-network providers.
        </p>
      </header>

      {/* Tab bar */}
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

      {/* Tab panels */}
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

/* ── Care Plan panel ────────────────────────────────────── */
function CarePlanPanel() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleFetch() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchCarePlan();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <section aria-labelledby="tab-careplan" className={styles.cpEmptyState}>
        <div className={styles.cpEmptyIcon} aria-hidden="true">📋</div>
        <h2 className={styles.cpEmptyTitle}>Your Recommended Care Plan</h2>
        <p className={styles.cpEmptyDesc}>
          See a personalised multi-year treatment schedule based on your coverage and dental
          history. Procedures are timed across plan years to maximise your annual benefit and
          minimise out-of-pocket costs.
        </p>
        <button
          className={styles.primaryBtn}
          onClick={handleFetch}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Loading care plan…' : 'View My Care Plan'}
        </button>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>
    );
  }

  const { planYears, comparison } = data;

  // Urgency → display config
  const URGENCY_CONFIG = {
    urgent:   { className: styles.cpUrgent,   icon: '⚠️' },
    deferred: { className: styles.cpDeferred, icon: '📅' },
    routine:  { className: styles.cpRoutine,  icon: null  },
  };

  return (
    <section aria-labelledby="tab-careplan">
      {/* ── Header strip ── */}
      <div className={styles.cpHeader}>
        <div>
          <h2 className={styles.cpMainTitle}>Your Recommended Care Plan</h2>
          <p className={styles.cpSubtitle}>
            Procedures are scheduled across plan years to stay under your{' '}
            <strong>${data.employee.annualMaximum.toLocaleString()}</strong> annual benefit
            maximum and reduce what you pay out-of-pocket.
          </p>
        </div>
      </div>

      {/* ── Legend ── */}
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

      {/* ── Main grid: plan columns + compare sidebar ── */}
      <div className={styles.cpGrid}>

        {/* Plan year columns */}
        <div className={styles.cpColumns}>
          {planYears.map((year, colIdx) => (
            <div key={year.year} className={styles.cpColumn}>
              {/* Year badge + heading */}
              <div className={styles.cpYearHeader}>
                <span className={styles.cpYearBadge} aria-hidden="true">{colIdx + 1}</span>
                <h3 className={styles.cpYearTitle}>{year.year} plan year</h3>
              </div>

              {/* Procedure cards */}
              <div className={styles.cpProcedures} role="list" aria-label={`${year.year} procedures`}>
                {year.procedures.map((proc) => {
                  const urgency = URGENCY_CONFIG[proc.urgency] ?? URGENCY_CONFIG.routine;
                  return (
                    <div
                      key={proc.id}
                      role="listitem"
                      className={`${styles.cpCard} ${urgency.className}`}
                    >
                      <div className={styles.cpCardTop}>
                        <span className={styles.cpCardMonth}>{proc.month}</span>
                        <div className={styles.cpCardBody}>
                          <p className={styles.cpCardName}>{proc.name}</p>
                          {proc.urgencyLabel && (
                            <p className={styles.cpCardStatus}>
                              {urgency.icon && (
                                <span className={styles.cpCardStatusIcon} aria-hidden="true">
                                  {urgency.icon}
                                </span>
                              )}
                              {proc.urgencyLabel}
                            </p>
                          )}
                          {proc.note && (
                            <p className={styles.cpCardNote}>{proc.note}</p>
                          )}
                        </div>
                      </div>
                      <div className={styles.cpCardMeta}>
                        <span className={styles.cpCardCategory}>{proc.category}</span>
                        <span className={styles.cpCardCost}>
                          {proc.patientCost === 0
                            ? 'No cost to you'
                            : `You pay ~$${proc.patientCost.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Annual max usage bar */}
              <div className={styles.cpMaxBar}>
                <div className={styles.cpMaxLabel}>
                  <span>Annual max used</span>
                  <span>
                    <strong>${year.annualMaxUsed.toLocaleString()}</strong> of $
                    {year.annualMaxTotal.toLocaleString()}
                  </span>
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

        {/* Compare sidebar */}
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
            <span className={styles.cpSavingsIcon} aria-hidden="true">💰</span>
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
            Costs are estimates based on your current plan coverage. Actual amounts may vary
            by provider and treatment complexity.
          </p>
        </aside>
      </div>

      {/* ── Footer disclaimer ── */}
      <p className={styles.cpDisclaimer}>
        <em>
          Urgent care is never delayed. Timing suggestions are for elective care only — confirm
          scheduling with your dentist.
        </em>
      </p>
    </section>
  );
}

/* ── Coverage panel ─────────────────────────────────────── */
function CoveragePanel() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

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

  return (
    <section aria-labelledby="tab-coverage">
      <p className={styles.panelIntro}>
        Retrieve your current dental coverage summary from the Lincoln Dental API.
      </p>
      <button className={styles.primaryBtn} onClick={handleFetch} disabled={loading}>
        {loading ? 'Fetching…' : 'Load My Coverage'}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {data && (
        <div className={styles.resultCard}>
          <h3 className={styles.resultTitle}>Coverage Summary</h3>
          <dl className={styles.dl}>
            <dt>Plan</dt>           <dd>{data.planName}</dd>
            <dt>Annual Max</dt>     <dd>${data.annualMaximum?.toLocaleString()}</dd>
            <dt>Deductible</dt>     <dd>${data.deductible} individual / ${data.familyDeductible} family</dd>
            <dt>Preventive</dt>     <dd>{data.preventiveCoverage}%</dd>
            <dt>Basic Restorative</dt><dd>{data.basicRestorativeCoverage}%</dd>
            <dt>Major Restorative</dt><dd>{data.majorRestorativeCoverage}%</dd>
            <dt>Orthodontia</dt>    <dd>{data.orthodontiaCoverage}% (up to ${data.orthodontiaLifetimeMax?.toLocaleString()})</dd>
            <dt>In-Network Only</dt><dd>{data.inNetworkOnly ? 'Yes' : 'No'}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}

/* ── Submit claim panel ─────────────────────────────────── */
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
          <Field label="Provider Name"  name="providerName"   value={form.providerName}   onChange={handleChange} placeholder="Dr. Smith" required />
          <Field label="Service Date"   name="serviceDate"    value={form.serviceDate}    onChange={handleChange} type="date" required />
        </div>
        <div className={styles.formRow}>
          <Field label="Procedure Code (ADA)" name="procedureCode" value={form.procedureCode} onChange={handleChange} placeholder="D0120" required />
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

/* ── Claim status panel ─────────────────────────────────── */
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
            <dt>Status</dt>           <dd className={styles[`status_${data.status?.toLowerCase()}`]}>{data.status}</dd>
            <dt>Provider</dt>         <dd>{data.providerName}</dd>
            <dt>Service Date</dt>     <dd>{data.serviceDate}</dd>
            <dt>Amount Billed</dt>    <dd>${data.amountBilled?.toFixed(2)}</dd>
            <dt>Amount Approved</dt>  <dd>${data.amountApproved?.toFixed(2)}</dd>
            <dt>Patient Owes</dt>     <dd>${data.patientResponsibility?.toFixed(2)}</dd>
            <dt>Explanation</dt>      <dd>{data.explanation}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}

/* ── Providers panel ────────────────────────────────────── */
function ProvidersPanel() {
  const [zip, setZip]         = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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

/* ── Reusable field ─────────────────────────────────────── */
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
