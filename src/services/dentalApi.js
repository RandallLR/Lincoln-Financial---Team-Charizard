/**
 * dentalApi.js
 * ─────────────────────────────────────────────────────────
 * Service layer for the Lincoln Financial Dental Assistance API.
 *
 * In production, every function makes a real HTTP request to the
 * backend (proxied through Vite to http://localhost:8080/api).
 * In development/demo mode the VITE_USE_MOCK_API env variable
 * activates the mock layer so the UI works without a live backend.
 *
 * Switching to a real backend:
 *   1. Remove (or set to "false") VITE_USE_MOCK_API in .env
 *   2. Set VITE_API_BASE_URL to your API gateway URL
 *   3. Replace the Authorization header value with a real JWT
 *      (pull it from your auth context / token store)
 */

import axios from 'axios';
import { mockDentalCoverage, mockSubmitClaim, mockClaimStatus, mockProviders } from './dentalApi.mock';

// ── Config ────────────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'
  || import.meta.env.DEV;   // default: use mock in dev

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/dental';

/** Shared Axios instance — attach auth token here when available */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject Bearer token from sessionStorage
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('lfg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: normalize error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(msg));
  }
);

// ── Public API ────────────────────────────────────────────

/**
 * GET /api/dental/coverage
 * Returns the authenticated employee's dental coverage summary.
 *
 * @returns {Promise<DentalCoverage>}
 */
export async function fetchDentalCoverage() {
  if (USE_MOCK) return mockDentalCoverage();
  return apiClient.get('/coverage');
}

/**
 * POST /api/dental/claims
 * Submits a new dental claim on behalf of the employee.
 *
 * @param {ClaimPayload} payload
 * @returns {Promise<ClaimSubmissionResult>}
 */
export async function submitDentalClaim(payload) {
  if (USE_MOCK) return mockSubmitClaim(payload);
  return apiClient.post('/claims', payload);
}

/**
 * GET /api/dental/claims/:claimId
 * Fetches the current status of a previously submitted claim.
 *
 * @param {string} claimId
 * @returns {Promise<ClaimStatus>}
 */
export async function fetchClaimStatus(claimId) {
  if (USE_MOCK) return mockClaimStatus(claimId);
  return apiClient.get(`/claims/${encodeURIComponent(claimId)}`);
}

/**
 * GET /api/dental/providers?zip=<zip>
 * Returns a list of in-network dental providers near the given ZIP.
 *
 * @param {string} zip
 * @returns {Promise<Provider[]>}
 */
export async function fetchDentalProviders(zip) {
  if (USE_MOCK) return mockProviders(zip);
  return apiClient.get('/providers', { params: { zip } });
}

// ── JSDoc type definitions (for IDE hints) ────────────────

/**
 * @typedef {Object} DentalCoverage
 * @property {string}  planName
 * @property {number}  annualMaximum
 * @property {number}  deductible
 * @property {number}  familyDeductible
 * @property {number}  preventiveCoverage          - percentage (0-100)
 * @property {number}  basicRestorativeCoverage     - percentage (0-100)
 * @property {number}  majorRestorativeCoverage     - percentage (0-100)
 * @property {number}  orthodontiaCoverage          - percentage (0-100)
 * @property {number}  orthodontiaLifetimeMax
 * @property {boolean} inNetworkOnly
 */

/**
 * @typedef {Object} ClaimPayload
 * @property {string} providerName
 * @property {string} serviceDate   - ISO date string (YYYY-MM-DD)
 * @property {string} procedureCode - ADA CDT code (e.g. "D0120")
 * @property {string} amount        - dollar amount as string
 * @property {string} [description]
 */

/**
 * @typedef {Object} ClaimSubmissionResult
 * @property {string} claimId
 * @property {string} status
 * @property {number} estimatedProcessingDays
 */

/**
 * @typedef {Object} ClaimStatus
 * @property {string} claimId
 * @property {string} status              - "Pending" | "Processing" | "Approved" | "Denied"
 * @property {string} providerName
 * @property {string} serviceDate
 * @property {number} amountBilled
 * @property {number} amountApproved
 * @property {number} patientResponsibility
 * @property {string} explanation
 */

/**
 * @typedef {Object} Provider
 * @property {string}  providerId
 * @property {string}  name
 * @property {string}  specialty
 * @property {string}  address
 * @property {string}  phone
 * @property {boolean} accepting
 */
