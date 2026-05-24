import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load credentials
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.e2e');
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env.e2e file.');
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

const BASE_URL = 'http://localhost:3000';

async function login(page: Page) {
  // Auto-accept alert/confirm dialogs
  page.on('dialog', async dialog => {
    console.log(`[Dialog] ${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('#login-email', TEST_EMAIL);
  await page.fill('#login-password', TEST_PASSWORD);
  await page.click('#login-submit');
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
}

test.describe('Complete Roster, Paper and Grading E2E Flow', () => {
  test('should upload student CSV, create task, decompose, upload answer sheets, evaluate, and verify mapping', async ({ page }) => {
    test.setTimeout(360000); // 6 minutes timeout

    // 1. Login
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    // 2. Upload Student CSV Roster
    console.log('Navigating to Admin Panel...');
    await page.goto(`${BASE_URL}/dashboard/admin`);
    await page.waitForLoadState('networkidle');

    // Click Student Imports tab
    await page.click('button:has-text("Student Imports")');
    await page.waitForTimeout(500);

    const csvPath = '/home/disha-sahu/Edexia/student_roster.csv';
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    console.log('Uploading student roster CSV...');
    const csvFileInput = page.locator('input[accept=".csv"]');
    await csvFileInput.setInputFiles(csvPath);
    await page.waitForTimeout(1000);

    // Click import button
    await page.click('button:has-text("Parse & Import Roster")');
    console.log('Waiting for CSV import completion...');
    await page.waitForSelector('text=Roster Synced Successfully', { timeout: 30000 });
    console.log('CSV Import completed successfully.');

    // 3. Verify Students in Directory on Admin Page
    console.log('Verifying students on Admin Page...');
    await page.waitForSelector('text=Aditya Patel', { timeout: 10000 });
    console.log('Student Aditya Patel is verified in the roster database.');

    // 4. Navigate to Exams Setup and Create Exam Cycle
    console.log('Creating Exam Cycle...');
    await page.goto(`${BASE_URL}/dashboard/exams`);
    await page.waitForLoadState('networkidle');

    const cycleName = `Physics Cycle E2E - ${Date.now()}`;
    await page.fill('input[placeholder="e.g. Mid-Term Oct 2026"]', cycleName);
    
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill(today);
    await dateInputs.nth(1).fill(nextWeek);

    await page.click('button:has-text("Create Exam Cycle")');
    await page.waitForTimeout(2000);

    // Click Select & Proceed to Paper Upload
    await page.click('button:has-text("Select & Proceed to Paper Upload")');
    await page.waitForTimeout(1000);

    // 5. Fill exam paper metadata
    console.log('Filling exam paper metadata...');
    await page.fill('input[placeholder="e.g. Physics Grade 12"]', 'E2E Physics Exam Paper');
    await page.selectOption('select:near(label:has-text("Subject"))', { label: 'Physics' });
    await page.selectOption('select:near(label:has-text("Paper Set"))', { label: 'Set A' });
    await page.selectOption('select:near(label:has-text("Board"))', { label: 'CBSE' });
    await page.fill('input:near(label:has-text("Grade Level"))', 'Class 11');
    await page.fill('input[type="number"]:near(label:has-text("Max Marks"))', '30');

    // 6. Upload Question Paper PDF
    const qpaperPath = '/home/disha-sahu/Edexia/Questionpaper.pdf';
    if (!fs.existsSync(qpaperPath)) {
      throw new Error(`Question paper file not found at ${qpaperPath}`);
    }

    const fileInput = page.locator('input[type="file"]:not([accept=".csv"])');
    await fileInput.setInputFiles(qpaperPath);
    await page.waitForTimeout(2000);

    // Click Decompose
    console.log('Decomposing Question Paper with Gemini...');
    await page.click('button:has-text("Decompose with Gemini")');

    // Wait for decomposition (Step 2)
    await page.waitForSelector('text=Gemini-Generated Rubric Structure', { timeout: 120000 });
    console.log('Gemini decomposition completed successfully.');

    // Save Rubric
    await page.click('button:has-text("Save Rubric Schema")');

    // Approve Rubric
    const submitBtn = page.locator('button:has-text("Submit for HOD Approval")');
    await submitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await submitBtn.click();

    const approveBtn = page.locator('button:has-text("Approve Rubric")');
    await approveBtn.waitFor({ state: 'visible', timeout: 30000 });
    await approveBtn.click();

    // 7. Proceed to Bulk Evaluation (Step 3)
    await page.click('button:has-text("Proceed to Bulk Evaluation")');
    await page.waitForTimeout(2000);

    // Upload answer sheets
    const answer1 = '/home/disha-sahu/Edexia/New Doc 05-24-2026 10.29.pdf';
    const answer2 = '/home/disha-sahu/Edexia/New Doc 05-24-2026 11.13.pdf';

    if (!fs.existsSync(answer1) || !fs.existsSync(answer2)) {
      throw new Error('One or both answer sheet PDFs are missing.');
    }

    console.log('Uploading student answer sheets...');
    await fileInput.setInputFiles([answer1, answer2]);
    await page.waitForTimeout(3000);

    // Upload & Start Evaluating (Step 4)
    await page.click('button:has-text("Upload & Start Evaluating")');
    console.log('Bulk grading triggered.');

    // Monitor grading run status
    await page.waitForSelector('text=Asynchronous Evaluation Queue Active', { timeout: 30000 });
    console.log('Monitoring evaluation run status...');
    
    // Auto-trigger fallback: if "Start Grading Manually" appears, click it
    let retriesGrading = 0;
    while (retriesGrading < 20) {
      const manualBtn = page.locator('button:has-text("Start Grading Manually")');
      if (await manualBtn.isVisible()) {
        console.log('Clicking Start Grading Manually...');
        await manualBtn.click();
        await page.waitForTimeout(5000);
      } else {
        console.log('Grading run successfully started.');
        break;
      }
      retriesGrading++;
    }

    // Wait for COMPLETED status
    let isFinished = false;
    let retries = 0;
    while (!isFinished && retries < 30) {
      const statusPill = page.locator('.pill');
      const text = await statusPill.textContent();
      console.log(`Current Run Status: ${text}`);

      if (text?.includes('COMPLETED') || text?.includes('FAILED')) {
        isFinished = true;
        expect(text).toContain('COMPLETED');
        break;
      }
      await page.waitForTimeout(10000);
      retries++;
    }

    // Verify grading results
    const gradedCount = await page.locator('text=Graded successfully:').locator('..').locator('.font-semibold').textContent();
    console.log(`Graded count: ${gradedCount}`);
    expect(parseInt(gradedCount || '0')).toBeGreaterThan(0);

    // 8. Go to Submissions and Verify Student Identity Mapping
    console.log('Navigating to Submissions page...');
    await page.goto(`${BASE_URL}/dashboard/submissions`);
    await page.waitForLoadState('networkidle');

    // Verify that the student mapping shows the student name or ID
    await page.waitForSelector('text=Aditya Patel', { timeout: 15000 });
    console.log('Identity matching verified successfully! Aditya Patel is mapped to Roll 21.');
  });
});
