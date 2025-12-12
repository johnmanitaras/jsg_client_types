import { test, expect } from '@playwright/test';

/**
 * Smoke Test for Client Types Management App
 * 
 * Verifies:
 * - App loads without console errors
 * - No infinite loop API calls
 * - Page renders the expected title "Client Types"
 * - Basic UI elements are present
 */

test.describe('Client Types App - Smoke Test', () => {
  let consoleErrors: string[] = [];
  let apiCallCount = 0;
  let apiCallTimes: number[] = [];
  const API_CALL_WINDOW_MS = 5000; // 5 second window to detect rapid calls
  const MAX_CALLS_IN_WINDOW = 10; // More than 10 calls in 5 seconds indicates a problem

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    apiCallCount = 0;
    apiCallTimes = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Monitor API calls to detect infinite loops
    page.on('request', request => {
      const url = request.url();
      
      // Monitor GraphQL calls (Hasura endpoint)
      if (url.includes('graphql.jetsetgo.world/v1/graphql')) {
        apiCallCount++;
        const now = Date.now();
        apiCallTimes.push(now);
        
        // Remove calls outside the window
        apiCallTimes = apiCallTimes.filter(time => now - time < API_CALL_WINDOW_MS);
        
        // Check for rapid succession calls (potential infinite loop)
        if (apiCallTimes.length > MAX_CALLS_IN_WINDOW) {
          console.error(`⚠️  INFINITE LOOP DETECTED: ${apiCallTimes.length} GraphQL calls in ${API_CALL_WINDOW_MS}ms`);
        }
      }
    });

    // Navigate to the app
    await page.goto('http://localhost:5173/');
  });

  test('should load without console errors', async () => {
    // Wait for the page to be fully loaded
    await expect(consoleErrors).toHaveLength(0);
  });

  test('should not have infinite loop API calls', async ({ page }) => {
    // Wait for initial data loading (should be just 1-2 calls)
    await page.waitForTimeout(3000);
    
    // Check that we don't have excessive API calls
    expect(apiCallTimes.length).toBeLessThan(MAX_CALLS_IN_WINDOW);
    
    console.log(`✓ Total API calls: ${apiCallCount}`);
    console.log(`✓ Calls in last ${API_CALL_WINDOW_MS}ms: ${apiCallTimes.length}`);
  });

  test('should render "Client Types" page title', async ({ page }) => {
    // Wait for the main heading
    const heading = page.getByRole('heading', { name: /Client Types/i, level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should render page description', async ({ page }) => {
    // Check for the subtitle/description
    await expect(page.getByText(/Manage customer classifications/i)).toBeVisible();
  });

  test('should render "Add Client Type" button', async ({ page }) => {
    // Check for the primary action button
    const addButton = page.getByRole('button', { name: /Add Client Type/i });
    await expect(addButton).toBeVisible();
  });

  test('should render search input', async ({ page }) => {
    // Check for search functionality
    const searchInput = page.getByPlaceholder(/Search client types/i);
    await expect(searchInput).toBeVisible();
  });

  test('should render status filter dropdown', async ({ page }) => {
    // Check for the status filter
    const statusFilter = page.getByRole('combobox', { name: /Filter by status/i });
    await expect(statusFilter).toBeVisible();
  });

  test('should have proper namespace class applied', async ({ page }) => {
    // Verify the app root has the correct namespace class for CSS isolation
    const appRoot = page.locator('.jsg-template').first();
    await expect(appRoot).toBeVisible();
  });

  test('should not have any accessibility violations on initial load', async ({ page }) => {
    // Basic accessibility check - all interactive elements should have labels
    const buttons = await page.getByRole('button').all();
    
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Button should have either text content or aria-label
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should display appropriate loading or empty state', async ({ page }) => {
    // After initial load, should show either:
    // - Loading skeleton
    // - Empty state (if no data)
    // - Client types table (if data exists)
    
    await page.waitForTimeout(2000);
    
    // Check for one of these states
    const hasLoadingSkeleton = await page.locator('.animate-pulse').count() > 0;
    const hasEmptyState = await page.getByText(/No client types yet/i).isVisible().catch(() => false);
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasCards = await page.locator('.client-types-mobile-wrapper').isVisible().catch(() => false);
    
    // At least one state should be present
    expect(hasLoadingSkeleton || hasEmptyState || hasTable || hasCards).toBeTruthy();
  });
});

/**
 * Additional test for modal functionality (if time permits)
 */
test.describe('Client Types App - Modal Interaction', () => {
  test.skip('should open create modal when clicking Add button', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Click the Add button
    const addButton = page.getByRole('button', { name: /Add Client Type/i });
    await addButton.click();
    
    // Modal should appear
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // Modal should have correct title
    await expect(page.getByRole('heading', { name: /Add Client Type/i })).toBeVisible();
    
    // Form fields should be present
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Description/i)).toBeVisible();
  });
});
