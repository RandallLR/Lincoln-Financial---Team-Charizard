/**
 * dentalApi.mock.js
 * ─────────────────────────────────────────────────────────
 * In-memory mock responses for every Dental API endpoint.
 * Simulates realistic network latency (300-800 ms) so the UI
 * loading states are exercised during development.
 *
 * This file is ONLY imported when VITE_USE_MOCK_API=true (or in dev).
 * It is tree-shaken out of production builds.
 */

/** Simulate a network round-trip */
function delay(min = 300, max = 800) {
  return new Promise((res) =>
    setTimeout(res, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

// ── Mock data ─────────────────────────────────────────────

const COVERAGE_DATA = {
  planName:                   'Lincoln Dental Premier',
  annualMaximum:              2000,
  deductible:                 50,
  familyDeductible:           150,
  preventiveCoverage:         100,
  basicRestorativeCoverage:   80,
  majorRestorativeCoverage:   50,
  orthodontiaCoverage:        50,
  orthodontiaLifetimeMax:     1500,
  inNetworkOnly:              false,
};

const CLAIMS_DB = {
  'CLM-2026-00123': {
    claimId:               'CLM-2026-00123',
    status:                'Approved',
    providerName:          'Dr. Alice Monroe, DDS',
    serviceDate:           '2026-08-15',
    amountBilled:          225.00,
    amountApproved:        180.00,
    patientResponsibility: 45.00,
    explanation:           'Claim approved. Patient co-pay applies per plan terms.',
  },
  'CLM-2026-00456': {
    claimId:               'CLM-2026-00456',
    status:                'Pending',
    providerName:          'Bright Smile Dental Group',
    serviceDate:           '2026-09-20',
    amountBilled:          840.00,
    amountApproved:        0,
    patientResponsibility: 0,
    explanation:           'Claim received and under review. Estimated decision within 5 business days.',
  },
  'CLM-2026-00789': {
    claimId:               'CLM-2026-00789',
    status:                'Denied',
    providerName:          'Riverside Orthodontics',
    serviceDate:           '2026-07-01',
    amountBilled:          3200.00,
    amountApproved:        0,
    patientResponsibility: 3200.00,
    explanation:           'Service not covered under current plan year orthodontia lifetime maximum.',
  },
};

const PROVIDERS_BY_ZIP = {
  default: [
    {
      providerId: 'PRV-001',
      name:       'Dr. Alice Monroe, DDS',
      specialty:  'General Dentistry',
      address:    '1234 Oak Street, Suite 100, Philadelphia, PA 19103',
      phone:      '(215) 555-0101',
      accepting:  true,
    },
    {
      providerId: 'PRV-002',
      name:       'Bright Smile Dental Group',
      specialty:  'General & Cosmetic Dentistry',
      address:    '567 Market St, Philadelphia, PA 19106',
      phone:      '(215) 555-0188',
      accepting:  true,
    },
    {
      providerId: 'PRV-003',
      name:       'Riverside Orthodontics',
      specialty:  'Orthodontics',
      address:    '890 Riverside Ave, Philadelphia, PA 19147',
      phone:      '(215) 555-0234',
      accepting:  false,
    },
    {
      providerId: 'PRV-004',
      name:       'Dr. Benjamin Park, DMD',
      specialty:  'Periodontics',
      address:    '321 Chestnut St, Philadelphia, PA 19106',
      phone:      '(215) 555-0312',
      accepting:  true,
    },
  ],
};

// ── Mock implementations ──────────────────────────────────

let claimCounter = 900;

export async function mockDentalCoverage() {
  await delay();
  return { ...COVERAGE_DATA };
}

export async function mockSubmitClaim(payload) {
  await delay(500, 1200);

  // Basic validation mirror
  if (!payload.providerName || !payload.serviceDate || !payload.procedureCode || !payload.amount) {
    throw new Error('All required claim fields must be completed.');
  }

  claimCounter += 1;
  const claimId = `CLM-2026-${String(claimCounter).padStart(5, '0')}`;

  // Store so it can be looked up by claim status tab
  CLAIMS_DB[claimId] = {
    claimId,
    status:                'Processing',
    providerName:          payload.providerName,
    serviceDate:           payload.serviceDate,
    amountBilled:          parseFloat(payload.amount) || 0,
    amountApproved:        0,
    patientResponsibility: 0,
    explanation:           'Claim received and is being processed.',
  };

  return {
    claimId,
    status:                   'Processing',
    estimatedProcessingDays:  5,
  };
}

export async function mockClaimStatus(claimId) {
  await delay();

  const claim = CLAIMS_DB[claimId];
  if (!claim) {
    throw new Error(`No claim found with ID "${claimId}". Please check and try again.`);
  }
  return { ...claim };
}

export async function mockProviders(zip) {
  await delay();

  // Return zip-specific data if we had it, otherwise return the default set
  const results = PROVIDERS_BY_ZIP[zip] ?? PROVIDERS_BY_ZIP.default;
  // Shuffle slightly to make different ZIPs feel distinct
  return [...results].sort(() => Math.random() - 0.5);
}
