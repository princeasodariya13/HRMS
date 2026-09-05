import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login as admin and land on dashboard, then logout', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials for admin
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const testPassword = process.env.TEST_ADMIN_PASSWORD || 'password123';
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Click sign in
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard/admin');
    
    // Check if the dashboard loaded by expecting an Admin-specific text or URL
    expect(page.url()).toContain('/dashboard/admin');
    await expect(page.locator('text=HR Overview').first()).toBeVisible({ timeout: 10000 });

    // Open user menu / profile picture (adjust selector if needed, usually an image or button in navbar)
    // Looking for the user avatar in TopNavbar
    await page.click('div.flex.items-center.gap-3 > div.relative > button');
    
    // Click Sign out button
    await page.click('button:has-text("Sign out")');

    // Wait for redirect back to login or home
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
});
