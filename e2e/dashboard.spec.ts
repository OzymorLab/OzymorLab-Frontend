import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─── Load credentials from .env.e2e ──────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.e2e');
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.e2e file. Create it with E2E_EMAIL and E2E_PASSWORD.');
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    vars[key.trim()] = rest.join('=').trim();
  }
  return vars;
}

const env = loadEnv();
const TEST_EMAIL = env.E2E_EMAIL;
const TEST_PASSWORD = env.E2E_PASSWORD;

if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error('⚠️  Fill in E2E_EMAIL and E2E_PASSWORD in .env.e2e before running tests.');
}

const BASE_URL = 'http://localhost:3000';

// ─── Helper: Login via UI ─────────────────────────────────
async function loginViaUI(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('#login-email', TEST_EMAIL);
  await page.fill('#login-password', TEST_PASSWORD);
  await page.click('#login-submit');

  // Wait for either the success message or direct redirect
  // The login flow is: Supabase auth → backend /auth/me → 800ms delay → router.push('/dashboard')
  try {
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
  } catch {
    // If URL didn't change, check if there's an error displayed
    const errorEl = page.locator('.auth-error');
    if (await errorEl.isVisible()) {
      const errorText = await errorEl.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }
    throw new Error('Login timed out — no redirect and no error message.');
  }
}

// ═══════════════════════════════════════════════════════════
//  SUITE 1: Landing Page (Public)
// ═══════════════════════════════════════════════════════════
test.describe('Landing Page', () => {
  test('should render branding and CTA links', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('a[href="/login"]')).toBeVisible();
  });

  test('Sign In link navigates to login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.locator('a[href="/login"]').click();
    await page.waitForURL('**/login**');
    await expect(page).toHaveURL(/login/);
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 2: Login Page UI (Public)
// ═══════════════════════════════════════════════════════════
test.describe('Login Page UI', () => {
  test('should render login form fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('#login-submit')).toBeVisible();
    await expect(page.locator('text=OzymorLab AIOS')).toBeVisible();
  });

  test('should toggle between Sign In and Create Account', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Create Account")');
    await expect(page.locator('#signup-name')).toBeVisible();
    await expect(page.locator('#signup-role')).toBeVisible();

    await page.click('button:has-text("Sign In")');
    await expect(page.locator('#login-email')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('#login-password', 'test');
    await page.locator('.form-input-toggle').click();
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'text');
  });

  test('should validate short signup password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login?tab=signup`);
    await page.waitForLoadState('networkidle');

    await page.fill('#signup-name', 'Test');
    await page.fill('#signup-email', 'test@test.com');
    await page.fill('#signup-password', 'short');
    
    // Check HTML5 validation validity since minLength={8} natively blocks form submission
    const isValid = await page.$eval('#signup-password', (el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);

    const valMsg = await page.$eval('#signup-password', (el: HTMLInputElement) => el.validationMessage);
    expect(valMsg.toLowerCase()).toContain('8 characters');
  });

  test('should show Google sign-in button', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('button:has-text("Sign In with Google")')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 3: Auth Guard Redirects (No Auth)
// ═══════════════════════════════════════════════════════════
test.describe('Auth Guard - redirects to login', () => {
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/exams',
    '/dashboard/submissions',
    '/dashboard/students',
    '/dashboard/reviews',
    '/dashboard/reports',
    '/dashboard/admin',
  ];

  for (const route of protectedRoutes) {
    test(`${route} should redirect to /login`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForURL('**/login**', { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});

// ═══════════════════════════════════════════════════════════
//  SUITE 4: Authenticated — Dashboard
// ═══════════════════════════════════════════════════════════
test.describe('Dashboard (Authenticated)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should render sidebar with all nav links', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    for (const link of ['Dashboard', 'Exams Setup', 'Submissions', 'Students', 'Reviews', 'Reports']) {
      await expect(page.locator(`text=${link}`).first()).toBeVisible();
    }
  });

  test('should show topbar search input', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 5: Authenticated — Submissions
// ═══════════════════════════════════════════════════════════
test.describe('Submissions Page (Authenticated)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should render header and reload button', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/submissions`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Evaluation Submissions')).toBeVisible();
    await expect(page.locator('text=Reload Queue')).toBeVisible();
  });

  test('should show search input and filter pills', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/submissions`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[placeholder*="Search Student ID"]')).toBeVisible();
    for (const s of ['ALL', 'GRADED', 'FAILED', 'PENDING']) {
      await expect(page.locator(`button:has-text("${s}")`)).toBeVisible();
    }
  });

  test('should show table headers', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/submissions`);
    await page.waitForLoadState('networkidle');

    for (const h of ['Student ID', 'Filename', 'Created Time', 'Status', 'Actions']) {
      await expect(page.locator(`th:has-text("${h}")`)).toBeVisible();
    }
  });

  test('filter pills should be clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/submissions`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("PENDING")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("ALL")');
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 6: Authenticated — Students
// ═══════════════════════════════════════════════════════════
test.describe('Students Page (Authenticated)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should render directory with stat cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/students`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Students Directory')).toBeVisible();
    await expect(page.locator('text=Total Students Registered')).toBeVisible();
    await expect(page.locator('text=Average Cohort Grade')).toBeVisible();
  });

  test('should have search and batch filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/students`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[placeholder*="Search Student ID"]')).toBeVisible();
    await expect(page.locator('button:has-text("All Cohorts")')).toBeVisible();
    await expect(page.locator('button:has-text("Batch-A")')).toBeVisible();
    await expect(page.locator('button:has-text("Batch-B")')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 7: Authenticated — Reviews
// ═══════════════════════════════════════════════════════════
test.describe('Reviews Page (Authenticated)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should render moderation center', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/reviews`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Institutional Moderation')).toBeVisible();
    await expect(page.locator('text=Refresh Lists')).toBeVisible();
    await expect(page.locator('text=Submissions Requiring Moderator Review')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 8: Authenticated — Reports
// ═══════════════════════════════════════════════════════════
test.describe('Reports Page (Authenticated)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should render reports dashboard with stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/reports`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Institutional Reports')).toBeVisible();
    for (const label of ['Active Institutional Roster', 'AI Papers Evaluated', 'Overall Average Grade', 'Assessment Pass Percentage']) {
      await expect(page.locator(`text=${label}`)).toBeVisible();
    }
  });

  test('should show performance registry with search', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/reports`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Student Performance Registry')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search Student"]')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 9: Authenticated — Admin
// ═══════════════════════════════════════════════════════════
test.describe('Admin Page (Authenticated)', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
  });

  test('should render admin panel with tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Institutional Administration Panel')).toBeVisible();
    await expect(page.locator('button:has-text("Student Imports")')).toBeVisible();
    await expect(page.locator('button:has-text("Teacher Invites")')).toBeVisible();
    await expect(page.locator('button:has-text("Classes & Roster")')).toBeVisible();
  });

  test('should switch tabs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/admin`);
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Teacher Invites")');
    await expect(page.locator('text=Bulk Invite Educators')).toBeVisible();

    await page.click('button:has-text("Classes & Roster")');
    await expect(page.locator('text=Class Standard & Section Hierarchies')).toBeVisible();

    await page.click('button:has-text("Student Imports")');
    await expect(page.locator('text=Roster CSV Import')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
//  SUITE 10: Full Navigation Flow
// ═══════════════════════════════════════════════════════════
test.describe('E2E Navigation Flow', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Skipped: fill E2E_EMAIL & E2E_PASSWORD in .env.e2e');

  test('should navigate through all sidebar pages', async ({ page }) => {
    await loginViaUI(page);

    await expect(page).toHaveURL(/dashboard/);

    // Exams
    await page.click('text=Exams Setup');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/exams/);

    // Submissions
    await page.click('text=Submissions');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/submissions/);
    await expect(page.locator('text=Evaluation Submissions')).toBeVisible();

    // Students
    await page.click('text=Students');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/students/);
    await expect(page.locator('text=Students Directory')).toBeVisible();

    // Reviews
    await page.click('text=Reviews');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/reviews/);

    // Reports
    await page.click('text=Reports');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/reports/);

    // Back to Dashboard
    await page.click('a:has-text("Dashboard")');
    await page.waitForLoadState('networkidle');
  });
});
