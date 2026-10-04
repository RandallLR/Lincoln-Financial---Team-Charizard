import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './DentalAssistancePage.module.css';

// ── Static plan snapshot ───────────────────────────────────
const PLAN_SNAPSHOT = {
  planName:        'Dental Premier',
  groupNumber:     'LF-2048',
  annualMaximum:   2000,
  annualUsed:      1055,
  deductible:      50,
  deductibleMet:   50,
  expiringAmount:  275,
  expiringDays:    62,
};

// ── SVG icon set ───────────────────────────────────────────
function Icon({ name, className }) {
  const cls = className || styles.iconMd;
  const paths = {
    arrow:    <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    bot:      <><rect width="14" height="11" x="5" y="8" rx="3"/><path d="M12 5V3"/><path d="M9 12h.01M15 12h.01M9 17v2M15 17v2"/></>,
    calendar: <><rect width="18" height="17" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    check:    <path d="m5 12 4 4L19 6"/>,
    chevron:  <path d="m9 18 6-6-6-6"/>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    upload:   <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/></>,
    wallet:   <><path d="M19 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h14v12H5a3 3 0 0 1-3-3V6"/><path d="M16 13h.01"/></>,
    x:        <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return (
    <svg
      aria-hidden="true"
      className={cls}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

// ── Progress row ───────────────────────────────────────────
function ProgressRow({ label, value, detail, percentage, variant }) {
  return (
    <div className={styles.progressBlock}>
      <div className={styles.progressLabelRow}>
        <span className={styles.progressLabel}>{label}</span>
        <span className={styles.progressValue}>{value}</span>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-label={`${label}: ${percentage}%`}
      >
        <div
          className={`${styles.progressFill} ${styles[`progressFill_${variant}`]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={styles.progressDetail}>{detail}</p>
    </div>
  );
}

// ── Quick action tile ──────────────────────────────────────
function QuickLink({ icon, title, copy, accent, to }) {
  return (
    <Link
      to={to}
      className={`${styles.quickLink} ${accent ? styles.quickLinkAccent : ''}`}
    >
      <span className={`${styles.quickLinkIcon} ${accent ? styles.quickLinkIconAccent : styles.quickLinkIconDefault}`}>
        <Icon name={icon} />
      </span>
      <span className={styles.quickLinkText}>
        <span className={styles.quickLinkTitle}>{title}</span>
        <span className={styles.quickLinkCopy}>{copy}</span>
      </span>
      <Icon name="chevron" className={styles.quickLinkChevron} />
    </Link>
  );
}

// ── Main page ──────────────────────────────────────────────
export default function DentalAssistancePage() {
  const s = PLAN_SNAPSHOT;
  const annualUsedPct  = Math.min(100, Math.round((s.annualUsed    / s.annualMaximum) * 100));
  const deductiblePct  = Math.min(100, Math.round((s.deductibleMet / s.deductible)    * 100));

  // File upload state
  const [file, setFile]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectFile = (selected) => {
    if (selected && (selected.type.startsWith('image/') || selected.type === 'application/pdf')) {
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={styles.page}>

      {/* ── Page hero ────────────────────────────────────── */}
      <div className={styles.hero}>
        <div>
          <p className={styles.heroEyebrow}>My benefits</p>
          <h1 className={styles.heroHeading}>Your Dental Plan Coverage Overview</h1>
          <p className={styles.heroSub}>
            See your coverage at a glance, manage claims, and find in-network care.
          </p>
        </div>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          Plan active through Dec 31, 2025
        </div>
      </div>

      {/* ── Summary cards row ────────────────────────────── */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardTop}>
            <span className={styles.summaryCardLabel}>Plan</span>
            <span className={`${styles.summaryCardIcon} ${styles.summaryCardIconPrimary}`}>
              <Icon name="shield" />
            </span>
          </div>
          <p className={styles.summaryCardValue}>{s.planName}</p>
          <p className={styles.summaryCardSub}>Group #{s.groupNumber}</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardTop}>
            <span className={styles.summaryCardLabel}>Annual benefit left</span>
            <span className={`${styles.summaryCardIcon} ${styles.summaryCardIconAccent}`}>
              <Icon name="wallet" />
            </span>
          </div>
          <p className={styles.summaryCardValue}>
            ${(s.annualMaximum - s.annualUsed).toLocaleString()}.00
          </p>
          <p className={styles.summaryCardSub}>of ${s.annualMaximum.toLocaleString()} available</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardTop}>
            <span className={styles.summaryCardLabel}>Next visit</span>
            <span className={`${styles.summaryCardIcon} ${styles.summaryCardIconGreen}`}>
              <Icon name="calendar" />
            </span>
          </div>
          <p className={styles.summaryCardValue}>Not scheduled</p>
          <button className={styles.summaryCardLink} type="button">Find a dentist</button>
        </div>
      </div>

      {/* ── Main two-column layout ────────────────────────── */}
      <div className={styles.mainGrid}>

        {/* LEFT column */}
        <div className={styles.leftCol}>

          {/* Coverage overview */}
          <section className={styles.card} aria-labelledby="coverage-heading">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="coverage-heading" className={styles.cardHeading}>Coverage overview</h2>
                <p className={styles.cardSubheading}>Benefits used in the 2025 plan year</p>
              </div>
              <button className={styles.cardHeaderBtn} type="button">
                View details <Icon name="arrow" className={styles.iconSm} />
              </button>
            </div>

            <div className={styles.progressStack}>
              <ProgressRow
                label="Annual maximum used"
                value={`$${s.annualUsed.toLocaleString()} of $${s.annualMaximum.toLocaleString()}`}
                detail={`$${s.annualMaximum - s.annualUsed} remains for covered dental services this year.`}
                percentage={annualUsedPct}
                variant="orange"
              />
              <ProgressRow
                label="Deductible met"
                value={`$${s.deductibleMet} of $${s.deductible}`}
                detail="Your individual deductible has been fully met."
                percentage={deductiblePct}
                variant="green"
              />
              <ProgressRow
                label="Preventive services available"
                value="100% remaining"
                detail="Preventive care is covered at 100% in network, with no cost to you."
                percentage={100}
                variant="green"
              />
            </div>

            <div className={styles.expiryBanner}>
              <div className={styles.expiryBannerLeft}>
                <span className={styles.expiryBannerIconWrap}>
                  <Icon name="clock" className={styles.iconLg} />
                </span>
                <div>
                  <p className={styles.expiryBannerTitle}>Benefits expiring soon</p>
                  <p className={styles.expiryBannerBody}>
                    ${s.expiringAmount} of benefits expire in {s.expiringDays} days.
                  </p>
                </div>
              </div>
              <Link to="/benefits/dental/compare-plans" className={styles.expiryBannerBtn}>
                View care plan
              </Link>
            </div>
          </section>

          {/* Upload claim */}
          <section className={styles.card} aria-labelledby="upload-heading">
            <h2 id="upload-heading" className={styles.cardHeading}>Upload a claim document</h2>
            <p className={styles.cardSubheading}>
              Add a photo of your receipt or explanation of benefits. We'll attach it to your next claim.
            </p>

            <input
              ref={inputRef}
              id="claim-file"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className={styles.srOnly}
              onChange={(e) => selectFile(e.target.files?.[0])}
            />

            {file ? (
              <div className={styles.fileSelected}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Document preview" className={styles.filePreviewImg} />
                ) : (
                  <span className={styles.filePreviewIcon}>
                    <Icon name="document" className={styles.iconLg} />
                  </span>
                )}
                <div className={styles.fileInfo}>
                  <p className={styles.fileReady}>
                    <Icon name="check" className={styles.iconSm} /> Ready to upload
                  </p>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className={styles.fileActions}>
                  <button
                    type="button"
                    className={styles.fileReplaceBtn}
                    onClick={() => inputRef.current?.click()}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    aria-label="Remove selected document"
                    className={styles.fileRemoveBtn}
                    onClick={() => setFile(null)}
                  >
                    <Icon name="x" className={styles.iconSm} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
              >
                <span className={styles.dropzoneIconWrap}>
                  <Icon name="upload" className={styles.iconLg} />
                </span>
                <p className={styles.dropzoneText}>
                  Drop your image here or <span className={styles.dropzoneBrowse}>browse files</span>
                </p>
                <p className={styles.dropzoneHint}>PNG, JPG, WEBP or PDF · Maximum 10 MB</p>
              </div>
            )}

            <div className={styles.uploadNote}>
              <Icon name="shield" className={styles.iconSm} />
              Your documents are encrypted and only used to process your benefits.
            </div>
          </section>
        </div>

        {/* RIGHT sidebar */}
        <aside className={styles.rightCol}>

          {/* Quick actions */}
          <section className={styles.card} aria-labelledby="quick-actions-heading">
            <div className={styles.quickActionsHeader}>
              <h2 id="quick-actions-heading" className={styles.cardHeading}>Quick actions</h2>
              <span className={styles.quickActionsAccentBar} />
            </div>
            <div className={styles.quickLinkStack}>
              <QuickLink
                accent
                icon="bot"
                title="Ask your coverage assistant"
                copy="Get help understanding coverage and costs."
                to="/benefits/dental/ai-chat"
              />
              <QuickLink
                icon="document"
                title="View or compare plans"
                copy="Compare benefits and estimated costs."
                to="/benefits/dental/compare-plans"
              />
              <QuickLink
                icon="calendar"
                title="Add a life event"
                copy="Report a marriage, birth, or other change."
                to="/life-event"
              />
              <QuickLink
                icon="shield"
                title="Find a dentist"
                copy="Find an in-network provider near you."
                to="/benefits/dental/find-provider"
              />
            </div>
          </section>

          {/* Specialist CTA */}
          <section className={styles.specialistCard} aria-labelledby="specialist-heading">
            <p className={styles.specialistEyebrow}>Need help?</p>
            <h2 id="specialist-heading" className={styles.specialistHeading}>
              Talk with a benefits specialist
            </h2>
            <p className={styles.specialistHours}>Monday–Friday, 8 a.m.–8 p.m. ET</p>
            <button className={styles.specialistBtn} type="button">
              Contact support <Icon name="arrow" className={styles.iconSm} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
