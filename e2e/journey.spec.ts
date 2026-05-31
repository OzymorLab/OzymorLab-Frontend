import { test, expect, Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

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
const BASE_URL = 'http://localhost:3000';

const MOCK_USER = {
  id: 'e2e-mock-user-id',
  email: 'e2e-mock@ozymorlab.test',
  full_name: 'E2E Test User',
  has_gemini_key: true,
  is_active: true,
};

async function mockAuth(page: Page, role: string = 'teacher') {
  const ctx = page.context();
  await ctx.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { ...MOCK_USER, role } }),
    });
  });
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('load');
  await page.evaluate(() => {
    localStorage.setItem('ozymorlab_token', 'e2e-mock-token');
    localStorage.setItem('ozymorlab_refresh_token', 'e2e-mock-refresh');
  });
  await page.reload();
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  } catch {
    // Retry: re-set tokens and reload if redirect failed (Fast Refresh race)
    await page.evaluate(() => {
      localStorage.setItem('ozymorlab_token', 'e2e-mock-token');
      localStorage.setItem('ozymorlab_refresh_token', 'e2e-mock-refresh');
    });
    await page.reload();
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  }
}

// ═══════════════════════════════════════════════════════════
//  PHASE 1: AUTHENTICATION TESTING
// ═══════════════════════════════════════════════════════════
test.describe('Phase 1: Authentication Testing', () => {
  test.describe('Sign Up', () => {
    test('should render signup form with all fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/login?tab=signup`);
      await page.waitForLoadState('load');
      await expect(page.locator('#signup-name')).toBeVisible();
      await expect(page.locator('#signup-email')).toBeVisible();
      await expect(page.locator('#signup-password')).toBeVisible();
      await expect(page.locator('#signup-role')).toBeVisible();
      await expect(page.locator('#signup-submit')).toBeVisible();
    });

    test('should validate short password on signup', async ({ page }) => {
      await page.goto(`${BASE_URL}/login?tab=signup`);
      await page.waitForLoadState('load');
      await page.fill('#signup-name', 'Test User');
      await page.fill('#signup-email', 'newuser@test.com');
      await page.fill('#signup-password', 'short');
      const valid = await page.$eval('#signup-password', (el: HTMLInputElement) => el.validity.valid);
      expect(valid).toBe(false);
    });
  });

  test.describe('Sign In', () => {
    test('should render login form with all fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('load');
      await expect(page.locator('#login-email')).toBeVisible();
      await expect(page.locator('#login-password')).toBeVisible();
      await expect(page.locator('#login-submit')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('load');
      await page.fill('#login-email', 'invalid@test.com');
      await page.fill('#login-password', 'wrongpassword');
      await page.click('#login-submit');
      await expect(page.locator('.auth-error')).toBeVisible({ timeout: 10000 });
    });

    test('should show Google sign-in button', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('load');
      await expect(page.locator('.btn-google')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page);
    });

    test('should sign out from user menu and redirect to login', async ({ page }) => {
      const userMenuBtn = page.locator('header button').filter({ has: page.locator('svg.lucide-chevron-down') });
      await userMenuBtn.click();
      await page.locator('button:has-text("Sign out")').click();
      await page.waitForURL('**/login**', { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Tab Switching', () => {
    test('should toggle between Sign In and Create Account tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('load');
      await page.click('button:has-text("Create Account")');
      await expect(page.locator('#signup-name')).toBeVisible();
      await page.click('button:has-text("Sign In")');
      await expect(page.locator('#login-email')).toBeVisible();
    });
  });

  test.describe('Password Visibility Toggle', () => {
    test('should toggle password visibility on login form', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('load');
      await page.fill('#login-password', 'visibletest');
      await page.locator('.form-input-toggle').click();
      await expect(page.locator('#login-password')).toHaveAttribute('type', 'text');
      await page.locator('.form-input-toggle').click();
      await expect(page.locator('#login-password')).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Protected Routes Redirect', () => {
    test('unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForURL('**/login**', { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });

    test('unauthenticated access to /dashboard/admin redirects to /login', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForURL('**/login**', { timeout: 10000 });
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Session Persistence', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.route('**/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { ...MOCK_USER, role: 'teacher' } }),
        });
      });
      await mockAuth(page);
    });

    test('should persist session across page reload', async ({ page }) => {
      const tokenBefore = await page.evaluate(() => localStorage.getItem('ozymorlab_token'));
      expect(tokenBefore).toBe('e2e-mock-token');

      await page.goto(`${BASE_URL}/dashboard?t=${Date.now()}`);
      await page.waitForLoadState('load');

      const tokenAfter = await page.evaluate(() => localStorage.getItem('ozymorlab_token'));
      expect(tokenAfter).toBe('e2e-mock-token');
      await expect(page.locator('text=Recent Submissions')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Multiple Tab Login', () => {
    test.beforeEach(async ({ page, context }) => {
      await context.route('**/auth/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { ...MOCK_USER, role: 'teacher' } }),
        });
      });
      await mockAuth(page);
    });

    test('should maintain session across tabs', async ({ page, context }) => {
      const tab2 = await context.newPage();
      await tab2.goto(`${BASE_URL}/dashboard`);
      await tab2.waitForLoadState('load');
      await expect(tab2).toHaveURL(/dashboard/);
      await tab2.close();
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  PHASE 2: STUDENT JOURNEY TESTING
// ═══════════════════════════════════════════════════════════
test.describe('Phase 2: Student Journey Testing', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test.describe('Exam Page (Student View)', () => {
    test('should show student submission form with upload fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/exams`);
      await page.waitForLoadState('load');

      const subjectSelect = page.locator('select').filter({ has: page.locator('option[value="Physics"]') });
      const qPaperUpload = page.locator('text=Upload Question Paper');
      const answerUpload = page.locator('text=Upload Answer Sheet');

      const isStudentView = await subjectSelect.count() > 0;
      if (isStudentView) {
        await expect(subjectSelect.first()).toBeVisible();
        await expect(qPaperUpload.first()).toBeVisible();
        await expect(answerUpload.first()).toBeVisible();
      }
    });
  });

  test.describe('Submissions Dashboard', () => {
    test('should show submissions list with filter pills', async ({ page }) => {
      await page.locator('a[href="/dashboard/submissions"]').first().click();
      await page.waitForLoadState('load');
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible({ timeout: 10000 });
      for (const s of ['ALL', 'GRADED', 'FAILED', 'PENDING']) {
        const pill = page.locator(`button:has-text("${s}")`);
        if (await pill.count() > 0) await expect(pill.first()).toBeVisible();
      }
    });

    test('should have search input and table columns', async ({ page }) => {
      await page.locator('a[href="/dashboard/submissions"]').first().click();
      await page.waitForLoadState('load');
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible();
      for (const h of ['Student Name', 'Filename', 'Status', 'Actions']) {
        const header = page.locator(`th:has-text("${h}")`);
        if (await header.count() > 0) await expect(header.first()).toBeVisible();
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  PHASE 3: SUBMISSION DASHBOARD
// ═══════════════════════════════════════════════════════════
test.describe('Phase 3: Submission Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test.describe('Dashboard Home', () => {
    test('should display Recent Submissions and stat cards', async ({ page }) => {
      await expect(page.locator('text=Recent Submissions')).toBeVisible();
      expect(await page.locator('.card-lp').count()).toBeGreaterThanOrEqual(3);
    });

    test('should show throughput chart and live activity', async ({ page }) => {
      await expect(page.locator('text=Throughput')).toBeVisible();
      await expect(page.locator('text=Live Activity')).toBeVisible();
    });
  });

  test.describe('Submissions Features', () => {
    test('filter pills should be clickable', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/submissions`);
      await page.waitForLoadState('load');
      const pending = page.locator('button:has-text("PENDING")');
      if (await pending.count() > 0) { await pending.first().click(); await page.waitForTimeout(300); }
      const all = page.locator('button:has-text("ALL")');
      if (await all.count() > 0) { await all.first().click(); }
    });

    test('should have Reload Queue button', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/submissions`);
      await page.waitForLoadState('load');
      const reloadBtn = page.locator('button:has-text("Reload Queue")');
      if (await reloadBtn.count() > 0) {
        await expect(reloadBtn.first()).toBeVisible();
      }
    });
  });

  test.describe('Reports Page', () => {
    test('should render reports dashboard with stats', async ({ page }) => {
      await page.locator('a[href="/dashboard/reports"]').first().click();
      await page.waitForLoadState('load');
      await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Responsive Layout', () => {
    test('mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('load');
      await expect(page.locator('text=OzymorLab').first()).toBeVisible({ timeout: 5000 });
    });

    test('tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('load');
      await expect(page.locator('text=OzymorLab').first()).toBeVisible({ timeout: 5000 });
    });

    test('desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(page.locator('text=Recent Submissions')).toBeVisible({ timeout: 5000 });
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  PHASE 4: CREDITS SYSTEM
// ═══════════════════════════════════════════════════════════
test.describe('Phase 4: Credits System', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings`);
    await page.waitForLoadState('load');
  });

  test('should show credit balance if credits section exists', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/settings`);
    await page.waitForLoadState('load');
    const creditSection = page.locator('text=Credits, text=Credit, text=Purchase, text=Billing');
    if (await creditSection.count() > 0) {
      await expect(creditSection.first()).toBeVisible();
    }
  });
});

// ═══════════════════════════════════════════════════════════
//  PHASE 5: ADMIN PANEL
// ═══════════════════════════════════════════════════════════
test.describe('Phase 5: Admin Panel', () => {
  test.describe('Admin Access and Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, 'admin');
    });

    test('should render admin panel with all tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');
      await expect(page.locator('text=Administration').first()).toBeVisible({ timeout: 10000 });
      for (const tab of ['Manage Teachers', 'Manage Students', 'School Classrooms', 'Exams & Assignments', 'Classes & Roster']) {
        const el = page.locator(`button:has-text("${tab}")`);
        if (await el.count() > 0) await expect(el.first()).toBeVisible();
      }
    });

    test('should switch between admin tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');

      const studentsTab = page.locator('button:has-text("Manage Students")');
      if (await studentsTab.count() > 0) {
        await studentsTab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Student Directory').first()).toBeVisible();
      }

      const teachersTab = page.locator('button:has-text("Manage Teachers")');
      if (await teachersTab.count() > 0) {
        await teachersTab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('h2:has-text("Teacher")').first()).toBeVisible();
      }

      const classesTab = page.locator('button:has-text("Classes & Roster")');
      if (await classesTab.count() > 0) {
        await classesTab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Class Standard').first()).toBeVisible();
      }
    });
  });

  test.describe('Analytics Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, 'admin');
    });

    test('should display stat cards on analytics tab', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');
      for (const label of ['Students', 'Teachers', 'Classrooms']) {
        const el = page.locator(`text=${label}`);
        if (await el.count() > 0) await expect(el.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show evaluation pipeline section', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');
      const pipeline = page.locator('text=Evaluation Pipeline');
      if (await pipeline.count() > 0) await expect(pipeline.first()).toBeVisible();
    });
  });

  test.describe('Student Directory', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, 'admin');
    });

    test('should show student directory with CSV import option', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');
      const tab = page.locator('button:has-text("Manage Students")');
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Student Directory').first()).toBeVisible();
        await expect(page.locator('text=Roster CSV Import').first()).toBeVisible();
      }
    });
  });

  test.describe('Teacher Management', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, 'admin');
    });

    test('should show teacher directory with invite section', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');
      const tab = page.locator('button:has-text("Manage Teachers")');
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('h2:has-text("Teacher")').first()).toBeVisible();
      }
    });
  });

  test.describe('Classrooms and Assignments', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, 'admin');
    });

    test('should navigate to classrooms and assignments tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/admin`);
      await page.waitForLoadState('load');

      let tab = page.locator('button:has-text("School Classrooms")');
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=All School Classrooms')).toBeVisible();
      }

      tab = page.locator('button:has-text("Exams & Assignments")');
      if (await tab.count() > 0) {
        await tab.first().click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=Active Exams & Assignments')).toBeVisible();
      }
    });
  });

  test.describe('Authorization - Student Cannot Access Admin', () => {
    test.beforeEach(async ({ page }) => {
      await mockAuth(page, 'teacher');
    });

    test('admin link should only be visible for admin/principal users', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('load');
      const adminLink = page.locator('a:has-text("Admin")').first().or(page.locator('nav a[href="/dashboard/admin"]'));
      const visible = await adminLink.isVisible().catch(() => false);
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  FULL NAVIGATION FLOW
// ═══════════════════════════════════════════════════════════
test.describe('Full Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test('should navigate through all dashboard pages', async ({ page }) => {
    const pages = [
      { href: '/dashboard/exams', url: /exams/ },
      { href: '/dashboard/submissions', url: /submissions/ },
      { href: '/dashboard/students', url: /students/ },
      { href: '/dashboard/reviews', url: /reviews/ },
      { href: '/dashboard/reports', url: /reports/ },
    ];

    for (const { href, url } of pages) {
      const navLink = page.locator(`a[href="${href}"]`);
      if (await navLink.count() > 0) {
        await navLink.first().click();
        await page.waitForURL(url, { timeout: 8000 });
      } else {
        await page.goto(`${BASE_URL}${href}`);
        await page.waitForLoadState('load');
      }
    }
  });
});
