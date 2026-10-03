import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

/**
 * Public login page.
 * After a successful sign-in, redirects to the page the user originally
 * requested (saved in location.state.from by ProtectedRoute), or /dashboard.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [form, setForm]       = useState({ employeeId: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.employeeId || !form.password) {
      setError('Employee ID and password are required.');
      return;
    }
    setLoading(true);
    try {
      await login(form.employeeId, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.logoMark} aria-hidden="true">LF</span>
          <div>
            <p className={styles.company}>Lincoln Financial Group</p>
            <p className={styles.portalTitle}>Employee Self-Service Portal</p>
          </div>
        </div>

        <h1 className={styles.heading}>Sign In</h1>

        {error && (
          <div role="alert" className={styles.errorBanner}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="employeeId" className={styles.label}>
              Employee ID
            </label>
            <input
              id="employeeId"
              name="employeeId"
              type="text"
              autoComplete="username"
              className={styles.input}
              value={form.employeeId}
              onChange={handleChange}
              placeholder="e.g. LFG-12345"
              aria-required="true"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              aria-required="true"
            />
          </div>

          <a href="/forgot-password" className={styles.forgotLink}>
            Forgot your password?
          </a>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className={styles.helpText}>
          Need access?{' '}
          <a href="mailto:hr@lincolnfinancial.com" className={styles.helpLink}>
            Contact HR
          </a>
        </p>
      </div>
    </div>
  );
}
