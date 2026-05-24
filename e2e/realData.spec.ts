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

test.describe('Real Data Assessment Flow', () => {
  test('should complete the entire paper decomposition and bulk grading flow', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout for processing/grading

    // 1. Login
    await login(page);
    await expect(page).toHaveURL(/dashboard/);

    // 2. Navigate to Exams Setup
    await page.goto(`${BASE_URL}/dashboard/exams`);
    await page.waitForLoadState('networkidle');

    // 3. Create a unique exam cycle
    const cycleName = `Real E2E Cycle - ${new Date().toLocaleDateString()}`;
    await page.fill('input[placeholder="e.g. Mid-Term Oct 2026"]', cycleName);
    
    // Dates (Today and next week)
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill(today);
    await dateInputs.nth(1).fill(nextWeek);

    await page.click('button:has-text("Create Exam Cycle")');
    await page.waitForTimeout(2000); // Wait for cycle creation

    // 4. Click proceed button to Step 1
    await page.click('button:has-text("Select & Proceed to Paper Upload")');
    await page.waitForTimeout(1000);

    // 5. Fill exam metadata
    await page.fill('input[placeholder="e.g. Physics Grade 12"]', 'E2E Physics Real Paper');
    await page.selectOption('select:near(label:has-text("Subject"))', { label: 'Physics' });
    await page.selectOption('select:near(label:has-text("Paper Set"))', { label: 'Set A' });
    await page.selectOption('select:near(label:has-text("Board"))', { label: 'CBSE' });
    await page.fill('input:near(label:has-text("Grade Level"))', 'Class 12');
    await page.fill('input[type="number"]:near(label:has-text("Max Marks"))', '30');

    // 6. Upload Question Paper PDF
    const qpaperPath = '/home/disha-sahu/Edexia/Questionpaper.pdf';
    if (!fs.existsSync(qpaperPath)) {
      throw new Error(`Question paper file not found at ${qpaperPath}`);
    }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(qpaperPath);
    await page.waitForTimeout(2000);

    // 7. Click Decompose
    await page.click('button:has-text("Decompose with Gemini")');

    // Wait for decomposition (Step 2 to be active)
    // AI paper decomposition might take 1-2 minutes
    console.log('Waiting for Gemini decomposition to complete...');
    await page.waitForSelector('text=Gemini-Generated Rubric Structure', { timeout: 120000 });
    console.log('Gemini decomposition completed successfully.');

    // 8. Confirm Rubric (Create Task)
    await page.click('button:has-text("Save Rubric Schema")');

    // 9. Approve Rubric (Handle teacher / hod status)
    // Wait for "Submit for HOD Approval" button to be visible and click it
    const submitBtn = page.locator('button:has-text("Submit for HOD Approval")');
    await submitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await submitBtn.click();

    // Now wait for "Approve Rubric" button to be visible and click it
    const approveBtn = page.locator('button:has-text("Approve Rubric")');
    await approveBtn.waitFor({ state: 'visible', timeout: 30000 });
    await approveBtn.click();

    // 10. Click Proceed to Bulk Evaluation (Step 3)
    await page.click('button:has-text("Proceed to Bulk Evaluation")');
    await page.waitForTimeout(2000);

    // 11. Upload Answer Sheets
    const answer1 = '/home/disha-sahu/Edexia/New Doc 05-24-2026 10.29.pdf';
    const answer2 = '/home/disha-sahu/Edexia/New Doc 05-24-2026 11.13.pdf';

    if (!fs.existsSync(answer1) || !fs.existsSync(answer2)) {
      throw new Error('One or both answer sheet PDFs are missing.');
    }

    await fileInput.setInputFiles([answer1, answer2]);
    await page.waitForTimeout(3000);

    // 12. Upload & Start Evaluating (Step 4)
    await page.click('button:has-text("Upload & Start Evaluating")');
    console.log('Bulk grading triggered.');

    // 13. Monitor grading run status
    await page.waitForSelector('text=Asynchronous Evaluation Queue Active', { timeout: 30000 });
    
    // Check if grading completed or is running
    console.log('Monitoring evaluation run status...');
    
    // We may need to start grading manually if the auto-trigger failed due to pending parsing
    let retriesGrading = 0;
    while (retriesGrading < 20) {
      const manualBtn = page.locator('button:has-text("Start Grading Manually")');
      if (await manualBtn.isVisible()) {
        console.log('Clicking Start Grading Manually...');
        await manualBtn.click();
        await page.waitForTimeout(5000); // Wait for API response and alert to close
      } else {
        console.log('Grading run successfully started.');
        break;
      }
      retriesGrading++;
    }

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
      await page.waitForTimeout(10000); // check every 10s
      retries++;
    }

    // Verify grading results
    const gradedCount = await page.locator('text=Graded successfully:').locator('..').locator('.font-semibold').textContent();
    console.log(`Graded count: ${gradedCount}`);
    expect(parseInt(gradedCount || '0')).toBeGreaterThan(0);
  });
});
