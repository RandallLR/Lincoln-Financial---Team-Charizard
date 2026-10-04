import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LifeEventPage.module.css';

// ── Sample plan data (DEMO — no real backend) ──────────────
const SAMPLE_PLAN = {
  planName: 'Lincoln Dental Premier',
  coverage: 'Employee + Family',
  memberId: 'LFG-12345',
};

// ── Life event definitions ─────────────────────────────────
const LIFE_EVENTS = [
  {
    id:           'marriage',
    label:        'Marriage',
    description:  'Add a spouse',
    dateLabel:    'Date of marriage',
    dateHint:     'Use the date shown on your marriage certificate.',
    relationship: 'Spouse',
  },
  {
    id:           'birth',
    label:        'Birth of a child',
    description:  'Add a child',
    dateLabel:    'Date of birth',
    dateHint:     '',
    relationship: 'Child',
  },
  {
    id:           'divorce',
    label:        'Divorce',
    description:  'Remove a spouse',
    dateLabel:    'Effective Date',
    dateHint:     'Use the date shown on your divorce decree.',
    relationship: 'N/A',
  },
];

/** Format an ISO date string (YYYY-MM-DD) for human-readable display */
function formatDate(isoString) {
  if (!isoString) return '—';
  // Append T00:00:00 to avoid UTC-offset date shifting
  const d = new Date(isoString + 'T00:00:00');
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Validate a date string.
 * Returns an error string on failure, or null on success.
 *
 * @param {string} value        - ISO date string (YYYY-MM-DD)
 * @param {object} opts
 * @param {boolean} opts.allowFuture   - if true, future dates are accepted
 * @param {number|null} opts.maxPastYears - if set, date must be within this many years ago
 */
function validateDate(value, { allowFuture = false, maxPastYears = null } = {}) {
  if (!value) return 'This field is required.';
  const d = new Date(value + 'T00:00:00');
  if (isNaN(d.getTime())) return 'Please enter a valid date.';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!allowFuture && d > today) return 'Date cannot be in the future.';
  if (maxPastYears != null) {
    const cutoff = new Date(today);
    cutoff.setFullYear(cutoff.getFullYear() - maxPastYears);
    if (d < cutoff) return `Date cannot be more than ${maxPastYears} years ago.`;
  }
  return null; // valid
}

// ── Step indicator component ───────────────────────────────
function StepIndicator({ step }) {
  const STEPS = [
    { num: 1, label: 'Life event' },
    { num: 2, label: 'Family details' },
    { num: 3, label: 'Review' },
  ];

  return (
    <nav aria-label="Form progress" className={styles.stepIndicator}>
      {STEPS.map((s, i) => {
        const isActive    = s.num === step;
        const isCompleted = s.num < step;
        const itemClass   = isActive
          ? `${styles.stepItem} ${styles.stepActive}`
          : isCompleted
          ? `${styles.stepItem} ${styles.stepDone}`
          : styles.stepItem;

        return (
          <React.Fragment key={s.num}>
            <div className={itemClass}>
              <div
                className={styles.stepCircle}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? <span aria-hidden="true">✓</span> : <span>{s.num}</span>}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={
                  isCompleted
                    ? `${styles.stepConnector} ${styles.stepConnectorDone}`
                    : styles.stepConnector
                }
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ── Sidebar component ──────────────────────────────────────
function Sidebar({ step, formData, selectedEvent }) {
  return (
    <aside className={styles.sidebar} aria-label="Form context">
      {/* Coverage card — always visible */}
      <div className={styles.sideCard}>
        <h2 className={styles.sideCardTitle}>Your coverage</h2>
        <dl className={styles.coverageDl}>
          <dt>Plan</dt>
          <dd>{SAMPLE_PLAN.planName}</dd>
          <dt>Coverage&nbsp;type</dt>
          <dd>{SAMPLE_PLAN.coverage}</dd>
          <dt>Member&nbsp;ID</dt>
          <dd>{SAMPLE_PLAN.memberId}</dd>
        </dl>
      </div>

      {/* Step 1: what comes next */}
      {step === 1 && (
        <div className={styles.sideCard}>
          <h2 className={styles.sideCardTitle}>What comes next?</h2>
          <ol className={styles.nextStepsList}>
            <li>Enter family member details</li>
            <li>Review and submit</li>
          </ol>
        </div>
      )}

      {/* Step 2: what comes next + selected event info */}
      {step === 2 && (
        <div className={styles.sideCard}>
          <h2 className={styles.sideCardTitle}>What comes next?</h2>
          <ol className={styles.nextStepsList}>
            <li>Review and submit</li>
          </ol>
          {selectedEvent && (
            <div className={styles.sideEventInfo}>
              <p className={styles.sideEventLabel}>Selected event</p>
              <p className={styles.sideEventValue}>
                {selectedEvent.label}
              </p>
              {formData.eventDate && (
                <>
                  <p className={styles.sideEventLabel}>{selectedEvent.dateLabel}</p>
                  <p className={styles.sideEventValue}>{formatDate(formData.eventDate)}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: full summary */}
      {step === 3 && selectedEvent && (
        <div className={styles.sideCard}>
          <h2 className={styles.sideCardTitle}>Summary</h2>
          <dl className={styles.coverageDl}>
            <dt>Life event</dt>
            <dd>
              {selectedEvent.label}
            </dd>
            <dt>{selectedEvent.dateLabel}</dt>
            <dd>{formatDate(formData.eventDate)}</dd>
            <dt>Family member</dt>
            <dd>
              {formData.firstName} {formData.lastName}
            </dd>
            <dt>Relationship</dt>
            <dd>{selectedEvent.relationship}</dd>
          </dl>
        </div>
      )}
    </aside>
  );
}

// ── Main page component ────────────────────────────────────
export default function LifeEventPage() {
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();

  const [step, setStep]           = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData]   = useState({
    eventType: '',
    eventDate: '',
    firstName: '',
    lastName:  '',
    dob:       '',
  });
  const [errors, setErrors] = useState({});

  // Refs for focus management when step changes
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const selectedEvent = LIFE_EVENTS.find((e) => e.id === formData.eventType) ?? null;

  // Move focus to the first interactive element when the step changes
  useEffect(() => {
    let el = null;
    if (step === 1 && step1Ref.current) {
      el = step1Ref.current.querySelector('button, input, select, textarea');
    } else if (step === 2 && step2Ref.current) {
      el = step2Ref.current.querySelector('button, input, select, textarea');
    } else if (step === 3 && step3Ref.current) {
      el = step3Ref.current;
    }
    if (el) el.focus();
  }, [step]);

  // ── Field helpers ────────────────────────────────────────
  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // ── Step 1 validation ────────────────────────────────────
  function validateStep1() {
    const errs = {};
    if (!formData.eventType) {
      errs.eventType = 'Please select a life event.';
    }
    if (!formData.eventDate) {
      errs.eventDate = 'This field is required.';
    } else {
      let err;
      if (formData.eventType === 'birth') {
        // Birth date: valid date, within the last 2 years, future births allowed
        err = validateDate(formData.eventDate, { allowFuture: true, maxPastYears: 2 });
      } else {
        // Marriage / adoption: must not be in the future
        err = validateDate(formData.eventDate, { allowFuture: false });
      }
      if (err) errs.eventDate = err;
    }
    return errs;
  }

  // ── Step 2 validation ────────────────────────────────────
  function validateStep2() {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim())  errs.lastName  = 'Last name is required.';
    const dobErr = validateDate(formData.dob, { allowFuture: false });
    if (dobErr) errs.dob = dobErr;
    return errs;
  }

  // ── Navigation handlers ──────────────────────────────────
  function handleContinueStep1() {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  }

  function handleContinueStep2() {
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(3);
  }

  function handleBackToStep1() { setErrors({}); setStep(1); }
  function handleBackToStep2() { setErrors({}); setStep(2); }

  function handleSubmit(e) {
    e.preventDefault();
    // DEMO mode — no network call; just flip to success state
    setSubmitted(true);
  }

  function handleReset() {
    setFormData({ eventType: '', eventDate: '', firstName: '', lastName: '', dob: '' });
    setErrors({});
    setSubmitted(false);
    setStep(1);
  }

  // ── Success screen ───────────────────────────────────────
  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successWrapper}>
          <div className={styles.successPanel} role="status" aria-live="polite">
            <div className={styles.successIcon} aria-hidden="true">✓</div>
            <h1 className={styles.successHeading}>Demo complete — no request was sent.</h1>
            <p className={styles.successBody}>
              In a real environment, submitting this request does not mean coverage is approved or
              active. You will receive confirmation once your plan administrator reviews your
              request.
            </p>
            <button type="button" className={styles.btnPrimary} onClick={handleReset}>
              Report another event
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <span className={styles.breadcrumbItem}>My coverage</span>
        <span className={styles.breadcrumbSep} aria-hidden="true">&nbsp;/&nbsp;</span>
        <span className={styles.breadcrumbCurrent} aria-current="page">
          Life event
        </span>
      </nav>

      {/* Page header + DEMO badge */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Report a life event</h1>
          <p className={styles.subheading}>Request a change to your dental coverage.</p>
        </div>
        <span className={styles.demoBadge} aria-label="Demo mode — no real submission will be made">
          DEMO
        </span>
      </header>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* Two-column layout */}
      <div className={styles.layout}>

        {/* ══ FORM AREA ══ */}
        <div className={styles.formArea}>

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div ref={step1Ref}>
              <form
                noValidate
                onSubmit={(e) => { e.preventDefault(); handleContinueStep1(); }}
                aria-labelledby="step1-heading"
              >
                <div className={styles.formCard}>
                  <h2 id="step1-heading" className={styles.stepHeading}>
                    Step 1 — Select a life event
                  </h2>

                  {/* Event type radio group */}
                  <fieldset
                    className={styles.fieldset}
                    aria-required="true"
                    aria-describedby={errors.eventType ? 'eventType-error' : undefined}
                  >
                    <legend className={styles.legend}>
                      Life event
                      <span className={styles.required} aria-hidden="true"> *</span>
                    </legend>
                    <div
                      className={styles.eventCards}
                      role="radiogroup"
                      aria-label="Select a life event"
                    >
                      {LIFE_EVENTS.map((ev) => {
                        const isSelected = formData.eventType === ev.id;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={
                              isSelected
                                ? `${styles.eventCard} ${styles.eventCardSelected}`
                                : styles.eventCard
                            }
                            onClick={() => updateField('eventType', ev.id)}
                          >
                            <span className={styles.eventLabel}>{ev.label}</span>
                            <span className={styles.eventDesc}>{ev.description}</span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.eventType && (
                      <p
                        id="eventType-error"
                        className={styles.errorText}
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.eventType}
                      </p>
                    )}
                  </fieldset>

                  {/* Event date */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="eventDate" className={styles.label}>
                      {selectedEvent ? selectedEvent.dateLabel : 'Event date'}
                      <span className={styles.required} aria-hidden="true"> *</span>
                    </label>
                    <input
                      id="eventDate"
                      type="date"
                      className={
                        errors.eventDate
                          ? `${styles.input} ${styles.inputError}`
                          : styles.input
                      }
                      value={formData.eventDate}
                      onChange={(e) => updateField('eventDate', e.target.value)}
                      aria-required="true"
                      aria-describedby={
                        [
                          selectedEvent?.dateHint ? 'eventDate-hint' : null,
                          errors.eventDate ? 'eventDate-error' : null,
                        ]
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                    />
                    {selectedEvent?.dateHint && (
                      <p id="eventDate-hint" className={styles.fieldHint}>
                        {selectedEvent.dateHint}
                      </p>
                    )}
                    {errors.eventDate && (
                      <p
                        id="eventDate-error"
                        className={styles.errorText}
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.eventDate}
                      </p>
                    )}
                  </div>

                  {/* Info banner */}
                  <div className={styles.infoBanner} role="note">
                    <span className={styles.infoIcon} aria-hidden="true">i</span>
                    <span>
                      Your plan determines eligibility, required documents, and enrollment
                      deadlines.
                    </span>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.btnPrimary}>
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <div ref={step2Ref}>
              <form
                noValidate
                onSubmit={(e) => { e.preventDefault(); handleContinueStep2(); }}
                aria-labelledby="step2-heading"
              >
                <div className={styles.formCard}>
                  <h2 id="step2-heading" className={styles.stepHeading}>
                    Step 2 — Family member details
                  </h2>

                  {/* Relationship (read-only) */}
                  {selectedEvent && (
                    <div className={styles.fieldGroup}>
                      <p className={styles.label} id="relationship-label">
                        Relationship
                      </p>
                      <p
                        className={styles.readonlyValue}
                        aria-labelledby="relationship-label"
                      >
                        {selectedEvent.relationship}
                      </p>
                    </div>
                  )}

                  {/* First name */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="firstName" className={styles.label}>
                      First name
                      <span className={styles.required} aria-hidden="true"> *</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      className={
                        errors.firstName
                          ? `${styles.input} ${styles.inputError}`
                          : styles.input
                      }
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      aria-required="true"
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    />
                    {errors.firstName && (
                      <p
                        id="firstName-error"
                        className={styles.errorText}
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last name */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="lastName" className={styles.label}>
                      Last name
                      <span className={styles.required} aria-hidden="true"> *</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      className={
                        errors.lastName
                          ? `${styles.input} ${styles.inputError}`
                          : styles.input
                      }
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      aria-required="true"
                      aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    />
                    {errors.lastName && (
                      <p
                        id="lastName-error"
                        className={styles.errorText}
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Date of birth */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="dob" className={styles.label}>
                      Date of birth
                      <span className={styles.required} aria-hidden="true"> *</span>
                    </label>
                    <input
                      id="dob"
                      type="date"
                      className={
                        errors.dob
                          ? `${styles.input} ${styles.inputError}`
                          : styles.input
                      }
                      value={formData.dob}
                      onChange={(e) => updateField('dob', e.target.value)}
                      aria-required="true"
                      aria-describedby={errors.dob ? 'dob-error' : undefined}
                    />
                    {errors.dob && (
                      <p
                        id="dob-error"
                        className={styles.errorText}
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.dob}
                      </p>
                    )}
                  </div>

                  {/* Documents note */}
                  <div className={styles.docNote} role="note">
                    <span>
                      Supporting documents (e.g. marriage certificate, birth certificate) may be
                      required depending on your plan.
                    </span>
                  </div>
                </div>{/* end formCard */}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleBackToStep1}
                  >
                    Back
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (
            /* tabIndex={-1} so useEffect can programmatically focus the wrapper */
            <div ref={step3Ref} tabIndex={-1} className={styles.step3Wrapper}>
              <form
                noValidate
                onSubmit={handleSubmit}
                aria-labelledby="step3-heading"
              >
                <div className={styles.formCard}>
                  <h2 id="step3-heading" className={styles.stepHeading}>
                    Step 3 — Review &amp; submit
                  </h2>

                  {/* Summary */}
                  <dl className={styles.summaryList}>
                    <div className={styles.summaryRow}>
                      <dt className={styles.summaryLabel}>Plan</dt>
                      <dd className={styles.summaryValue}>{SAMPLE_PLAN.planName}</dd>
                    </div>
                    <div className={styles.summaryRow}>
                      <dt className={styles.summaryLabel}>Life event</dt>
                      <dd className={styles.summaryValue}>
                        {selectedEvent
                          ? selectedEvent.label
                          : '—'}
                      </dd>
                    </div>
                    <div className={styles.summaryRow}>
                      <dt className={styles.summaryLabel}>
                        {selectedEvent?.dateLabel ?? 'Event date'}
                      </dt>
                      <dd className={styles.summaryValue}>{formatDate(formData.eventDate)}</dd>
                    </div>
                    <div className={styles.summaryRow}>
                      <dt className={styles.summaryLabel}>Family member</dt>
                      <dd className={styles.summaryValue}>
                        {formData.firstName} {formData.lastName}
                      </dd>
                    </div>
                    <div className={styles.summaryRow}>
                      <dt className={styles.summaryLabel}>Date of birth</dt>
                      <dd className={styles.summaryValue}>{formatDate(formData.dob)}</dd>
                    </div>
                    <div className={styles.summaryRow}>
                      <dt className={styles.summaryLabel}>Relationship</dt>
                      <dd className={styles.summaryValue}>
                        {selectedEvent?.relationship ?? '—'}
                      </dd>
                    </div>
                  </dl>

                  {/* Coverage note — no fake dollar amounts */}
                  <div className={styles.infoBanner} role="note">
                    <span className={styles.infoIcon} aria-hidden="true">i</span>
                    <span>
                      Updated costs and coverage dates will be confirmed by your benefits
                      administrator.
                    </span>
                  </div>

                  {/* Submission disclaimer */}
                  <p className={styles.disclaimer}>
                    Submitting this request does not mean coverage is approved or active. You will
                    receive confirmation once your plan administrator reviews your request.
                  </p>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={handleBackToStep2}
                  >
                    Back
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    Submit change request
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ══ SIDEBAR ══ */}
        <Sidebar step={step} formData={formData} selectedEvent={selectedEvent} />
      </div>
    </div>
  );
}
