import React, { useState } from 'react';
import {
  fetchDentalCoverage,
  submitDentalClaim,
  fetchClaimStatus,
  fetchDentalProviders,
} from '../services/dentalApi';
import styles from './DentalAssistancePage.module.css';

const TABS = [
  { id: 'coverage',   label: 'My Coverage'       },
  { id: 'claim',      label: 'Submit a Claim'     },
  { id: 'status',     label: 'Claim Status'       },
  { id: 'providers',  label: 'Find a Provider'    },
];

/**
 * Dental Assistance page — the primary interface to the Dental API.
 * Each tab dispatches a different API endpoint.
 */
export default function DentalAssistancePage() {
  const [activeTab, setActiveTab] = useState('coverage');

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
        {activeTab === 'coverage'  && <CoveragePanel />}
        {activeTab === 'claim'     && <ClaimPanel />}
        {activeTab === 'status'    && <ClaimStatusPanel />}
        {activeTab === 'providers' && <ProvidersPanel />}
      </div>
    </div>
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
