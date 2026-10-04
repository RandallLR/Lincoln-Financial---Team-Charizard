import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * AuthContext
 * ─────────────────────────────────────────────────────────
 * Provides authentication state and actions to the entire app.
 *
 * In production, replace the mock `authenticate()` call inside
 * `login()` with a real POST to your identity provider / API
 * (e.g. POST /api/auth/login).  The returned JWT should be stored
 * in the `lfg_token` key so the Axios interceptor in dentalApi.js
 * picks it up automatically.
 *
 * Session is persisted to sessionStorage so a page refresh keeps
 * the user logged in for the current browser tab.
 */

// ── Mock employee store ────────────────────────────────────
// Replace / remove once a real auth endpoint is available.
const MOCK_EMPLOYEES = {
  'LFG-12345': {
    password:     'Password1!',
    name:         'Jordan Lee',
    firstName:    'Jordan',
    lastName:     'Lee',
    preferredName:'Jordan',
    employeeId:   'LFG-12345',
    title:        'Senior Benefits Analyst',
    department:   'Human Resources',
    email:        'jordan.lee@lincolnfinancial.com',
    phone:        '(215) 555-1234',
    address:      '100 N Greene St, Greensboro, NC 27401',
  },
  'LFG-99999': {
    password:     'Admin123!',
    name:         'Alex Rivera',
    firstName:    'Alex',
    lastName:     'Rivera',
    preferredName:'Alex',
    employeeId:   'LFG-99999',
    title:        'HR Systems Administrator',
    department:   'IT / HR Systems',
    email:        'alex.rivera@lincolnfinancial.com',
    phone:        '(215) 555-9999',
    address:      '150 N Radnor Chester Rd, Radnor, PA 19087',
  },
};

const SESSION_KEY = 'lfg_session';
const TOKEN_KEY   = 'lfg_token';

// ── Context ────────────────────────────────────────────────
const AuthContext = createContext(null);

/**
 * Hook for consuming auth state from any component.
 * @returns {{ user: Employee|null, loading: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while we read sessionStorage

  // Rehydrate session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Corrupted storage — clear it
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Authenticate an employee.
   * Throws an Error with a human-readable message on failure.
   *
   * @param {string} employeeId
   * @param {string} password
   */
  const login = useCallback(async (employeeId, password) => {
    // ── Swap this block for a real API call ──────────────
    const employee = await authenticate(employeeId, password);
    // ────────────────────────────────────────────────────

    // Strip the password before storing in state / sessionStorage
    const { password: _pw, ...safeEmployee } = employee;

    // Persist session + mock JWT
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeEmployee));
    sessionStorage.setItem(TOKEN_KEY, generateMockToken(safeEmployee));

    setUser(safeEmployee);
  }, []);

  /** Clear session and auth token */
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Internal helpers ───────────────────────────────────────

/**
 * Mock authentication — replace with a real fetch() / axios call.
 * Simulates ~400 ms network latency.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Employee>}
 */
async function authenticate(email, password) {
  await new Promise((res) => setTimeout(res, 400));

  const employee = Object.values(MOCK_EMPLOYEES).find(
    (e) => e.email.toLowerCase() === email?.toLowerCase()
  );

  if (!employee || employee.password !== password) {
    throw new Error('Invalid email or password. Please try again.');
  }

  return employee;
}

/**
 * Generates a placeholder JWT-shaped token for development.
 * A real backend would return a signed JWT; store it here.
 */
function generateMockToken(employee) {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub:  employee.employeeId,
    name: employee.name,
    iat:  Math.floor(Date.now() / 1000),
    exp:  Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }));
  const sig = btoa('mock-signature');
  return `${header}.${payload}.${sig}`;
}
