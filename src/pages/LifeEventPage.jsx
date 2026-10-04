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
    description:  'Add your spouse',
    dateLabel:    'Date of marriage',
    dateHint:     'Use the date shown on your marriage certificate.',
    relationship: 'Spouse',
    icon:         'heart',
  },
  {
    id:           'birth',
    label:        'Birth of a child',
    description:  'Add your new child',
    dateLabel:    'Date of birth',
    dateHint:     '',
    relationship: 'Child',
    icon:         'baby',
  },
  {
    id:           'adoption',
    label:        'Adoption',
    description:  'Add a dependent',
    dateLabel:    'Date of adoption',
    dateHint:     'Use the date shown on the adoption decree.',
    relationship: 'Child',
    icon:         'users',
  },
  {
    id:           'divorce',
    label:        'Divorce or separation',
    description:  'Update your household',
    dateLabel:    'Effective date',
    dateHint:     'Use the date shown on your divorce decree.',
    relationship: 'N/A',
    icon:         'document',
  },
];

// ── SVG icons ──────────────────────────────────────────────
function Icon({ name, className }) {
  const cls = className || styles.iconMd;
  const paths = {
    arrow:    <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    baby:     <><path d="M9 12h.01M15 12h.01"/><path d="M10 16c.7.5 1.3.7 2 .7s1.3-.2 2-.7"/><path d="M12 3a9 9 0 1 0 9 9c0-1.2-.2-2.4-.7-3.4"/><path d="M12 3c2.8 0 4.5 1.5 4.5 3.2 0 1.3-1 2.3-2.2 2.3-1.1 0-2-.8-2-1.8 0-.8.6-1.5 1.4-1.5"/></>,
    check:    <path d="m5 12 4 4L19 6"/>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    heart:    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
    users:    <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  };
  return (
    <svg aria-hidden="true" className={cls} fill="none" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

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
    <div className={styles.stepIndicatorWrap}>
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
              {i > 0 && (
                <div
                  className={
                    isCompleted || isActive
                      ? `${styles.stepConnector} ${styles.stepConnectorDone}`
                      : styles.stepConnector
                  }
                  aria-hidden="true"
                />
              )}
              <div className={itemClass}>
                <div
                  className={styles.stepCircle}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <span aria-hidden="true">✓</span> : <span>{s.num}</span>}
                </div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}

// ── Sidebar component ──────────────────────────────────────
const NEXT_STEPS = [
  { num: '1', title: 'Add family details',  copy: 'Tell us who is affected by this change.' },
  { num: '2', title: 'Upload documents',    copy: 'We\'ll show you exactly what is needed.' },
  { num: '3', title: 'Review and submit',   copy: 'Confirm your information before sending.' },
];

function Sidebar({ step, formData, selectedEvent }) {
  return (
    <aside className={styles.sidebar} aria-label="Form context">
      {/* Coverage card — always visible */}
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitleRow}>
          <span className={styles.sideCardIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </span>
          <h2 className={styles.sideCardTitle}>Your coverage</h2>
        </div>
        <dl className={styles.coverageDl}>
          <dt>Plan</dt>
          <dd>{SAMPLE_PLAN.planName}</dd>
          <dt>Coverage</dt>
          <dd>{SAMPLE_PLAN.coverage}</dd>
          <dt>Member&nbsp;ID</dt>
          <dd>{SAMPLE_PLAN.memberId}</dd>
        </dl>
      </div>

      {/* Step 1 & 2: What comes next — numbered with copy */}
      {step < 3 && (
        <div className={styles.sideCard}>
          <h2 className={styles.sideCardTitle}>What comes next?</h2>
          <ol className={styles.nextStepsList}>
            {NEXT_STEPS.slice(step - 1).map(({ num, title, copy }) => (
              <li key={num} className={styles.nextStepsItem}>
                <span className={styles.nextStepsNum}>{num}</span>
                <span>
                  <span className={styles.nextStepsTitle}>{title}</span>
                  <span className={styles.nextStepsCopy}>{copy}</span>
                </span>
              </li>
            ))}
          </ol>
          {step === 2 && selectedEvent && (
            <div className={styles.sideEventInfo}>
              <p className={styles.sideEventLabel}>Selected event</p>
              <p className={styles.sideEventValue}>{selectedEvent.label}</p>
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
            <dd>{selectedEvent.label}</dd>
            <dt>{selectedEvent.dateLabel}</dt>
            <dd>{formatDate(formData.eventDate)}</dd>
            <dt>Family member</dt>
            <dd>{formData.firstName} {formData.lastName}</dd>
            <dt>Relationship</dt>
            <dd>{selectedEvent.relationship}</dd>
          </dl>
        </div>
      )}

      {/* Documents card — dark, always visible */}
      <div className={styles.sideCardDark}>
        <div className={styles.sideCardDarkInner}>
          <svg aria-hidden="true" className={styles.sideCardDarkIcon} fill="none" stroke="currentColor"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
            <path d="M14 2v6h6M8 13h8M8 17h6"/>
          </svg>
          <div>
            <h2 className={styles.sideCardDarkTitle}>Have documents ready</h2>
            <p className={styles.sideCardDarkBody}>
              Examples may include a marriage certificate, birth certificate, or court document.
            </p>
          </div>
        </div>
      </div>
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
        <span className={styles.breadcrumbSep} aria-hidden="true"> › </span>
        <span className={styles.breadcrumbCurrent} aria-current="page">Life event</span>
      </nav>

      {/* Eyebrow + heading row */}
      <div className={styles.pageIntro}>
        <div className={styles.pageIntroMain}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>Coverage update</span>
            <span className={styles.demoBadge} aria-label="Demo mode — no real submission will be made">
              DEMO
            </span>
          </div>
          <h1 className={styles.heading}>Report a life event</h1>
          <p className={styles.subheading}>
            Life changes, and sometimes your benefits need to change with it. Whether you're
            celebrating exciting news or navigating an unexpected change, you may be eligible
            to update your health insurance coverage. Complete the form with details about
            your life event and have any supporting documents ready—we'll help guide you
            through the next steps.
          </p>
        </div>
        <div className={styles.timingCard} role="note">
          <span className={styles.timingIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <rect width="18" height="17" x="3" y="4" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
            </svg>
          </span>
          <div>
            <p className={styles.timingTitle}>Timing matters</p>
            <p className={styles.timingBody}>Most changes must be reported within 30 days of the event.</p>
          </div>
        </div>
      </div>

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
                  <p className={styles.stepEyebrow}>Step 1 of 3</p>
                  <h2 id="step1-heading" className={styles.stepHeading}>
                    Tell us what changed
                  </h2>
                  <p className={styles.stepSubtext}>Select the life event that applies to you.</p>

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
                    <div className={styles.eventCards}>
                      {LIFE_EVENTS.map((ev) => {
                        const isSelected = formData.eventType === ev.id;
                        return (
                          <label
                            key={ev.id}
                            className={
                              isSelected
                                ? `${styles.eventCard} ${styles.eventCardSelected}`
                                : styles.eventCard
                            }
                          >
                            <input
                              type="radio"
                              name="life-event"
                              value={ev.id}
                              checked={isSelected}
                              onChange={() => updateField('eventType', ev.id)}
                              className={styles.srOnly}
                            />
                            <span className={`${styles.eventCardIcon} ${isSelected ? styles.eventCardIconSelected : ''}`}>
                              <Icon name={ev.icon} className={styles.iconSm} />
                            </span>
                            <span className={styles.eventCardText}>
                              <span className={styles.eventLabel}>{ev.label}</span>
                              <span className={styles.eventDesc}>{ev.description}</span>
                            </span>
                            <span className={`${styles.eventCardRadio} ${isSelected ? styles.eventCardRadioSelected : ''}`} aria-hidden="true">
                              {isSelected && <Icon name="check" className={styles.iconXs} />}
                            </span>
                          </label>
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
                  <button
                    type="button"
                    className={styles.btnCancel}
                    onClick={handleReset}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btnPrimary} ${!(formData.eventType && formData.eventDate) ? styles.btnPrimaryMuted : ''}`}
                  >
                    Continue to family details
                    <Icon name="arrow" className={styles.iconSm} />
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
                  <p className={styles.stepEyebrow}>Step 2 of 3</p>
                  <h2 id="step2-heading" className={styles.stepHeading}>
                    Family member details
                  </h2>
                  <p className={styles.stepSubtext}>Tell us about the person you're adding or changing.</p>

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
                  <p className={styles.stepEyebrow}>Step 3 of 3</p>
                  <h2 id="step3-heading" className={styles.stepHeading}>
                    Review &amp; submit
                  </h2>
                  <p className={styles.stepSubtext}>Please confirm the details below before submitting.</p>

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
