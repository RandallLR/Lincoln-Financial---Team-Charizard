import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './ProfilePage.module.css';

const SECTIONS = ['Personal Info', 'Dependents', 'Emergency Contact', 'Security'];

/**
 * Employee profile page.
 * Displays read-only employee info and provides edit sections for
 * personal info, dependents, emergency contact, and security settings.
 */
export default function ProfilePage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('Personal Info');
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    // In a real app, dispatch an API call here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My Profile</h1>

      {/* Employee summary card */}
      <div className={styles.summaryCard}>
        <div className={styles.avatar} aria-hidden="true">
          {user?.name?.charAt(0) ?? 'E'}
        </div>
        <div>
          <p className={styles.userName}>{user?.name ?? 'Employee Name'}</p>
          <p className={styles.userMeta}>
            {user?.title ?? 'Title'} · {user?.department ?? 'Department'}
          </p>
          <p className={styles.userMeta}>
            ID: {user?.employeeId ?? '—'} · {user?.email ?? '—'}
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar nav */}
        <nav className={styles.sideNav} aria-label="Profile sections">
          {SECTIONS.map((s) => (
            <button
              key={s}
              className={`${styles.sideBtn} ${activeSection === s ? styles.sideBtnActive : ''}`}
              onClick={() => setActiveSection(s)}
              aria-current={activeSection === s ? 'page' : undefined}
            >
              {s}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className={styles.content}>
          {saved && (
            <div role="status" className={styles.savedBanner}>
              ✓ Changes saved successfully.
            </div>
          )}

          {activeSection === 'Personal Info' && (
            <form onSubmit={handleSave} className={styles.form}>
              <h2 className={styles.sectionHeading}>Personal Information</h2>
              <ProfileField label="Legal First Name"  defaultValue={user?.firstName} />
              <ProfileField label="Legal Last Name"   defaultValue={user?.lastName} />
              <ProfileField label="Preferred Name"    defaultValue={user?.preferredName} />
              <ProfileField label="Work Email"        defaultValue={user?.email} type="email" />
              <ProfileField label="Personal Phone"    defaultValue={user?.phone} type="tel" />
              <ProfileField label="Home Address"      defaultValue={user?.address} />
              <button type="submit" className={styles.saveBtn}>Save Changes</button>
            </form>
          )}

          {activeSection === 'Dependents' && (
            <form onSubmit={handleSave} className={styles.form}>
              <h2 className={styles.sectionHeading}>Dependents</h2>
              <p className={styles.hint}>
                Add or remove dependents covered under your benefit plans.
              </p>
              <div className={styles.depCard}>
                <p className={styles.depName}>Dependent 1 — Spouse</p>
                <ProfileField label="Full Name"    defaultValue="Jane Doe" />
                <ProfileField label="Date of Birth" defaultValue="1988-04-12" type="date" />
                <ProfileField label="Relationship" defaultValue="Spouse" />
              </div>
              <button type="submit" className={styles.saveBtn}>Save Changes</button>
            </form>
          )}

          {activeSection === 'Emergency Contact' && (
            <form onSubmit={handleSave} className={styles.form}>
              <h2 className={styles.sectionHeading}>Emergency Contact</h2>
              <ProfileField label="Contact Name"         defaultValue="Jane Doe" />
              <ProfileField label="Relationship"         defaultValue="Spouse" />
              <ProfileField label="Phone Number"         defaultValue="555-867-5309" type="tel" />
              <ProfileField label="Alternate Phone"      defaultValue="" type="tel" />
              <button type="submit" className={styles.saveBtn}>Save Changes</button>
            </form>
          )}

          {activeSection === 'Security' && (
            <form onSubmit={handleSave} className={styles.form}>
              <h2 className={styles.sectionHeading}>Security Settings</h2>
              <ProfileField label="Current Password" defaultValue="" type="password" placeholder="••••••••" />
              <ProfileField label="New Password"     defaultValue="" type="password" placeholder="••••••••" />
              <ProfileField label="Confirm Password" defaultValue="" type="password" placeholder="••••••••" />
              <p className={styles.hint}>
                Password must be at least 12 characters and include uppercase, lowercase,
                a number, and a special character.
              </p>
              <button type="submit" className={styles.saveBtn}>Update Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, defaultValue, type = 'text', placeholder }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={styles.input}
        aria-label={label}
      />
    </div>
  );
}
