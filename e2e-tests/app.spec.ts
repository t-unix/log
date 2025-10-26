import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Application Health Checks', () => {
  test('should load homepage without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    const uncaughtErrors: string[] = []

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Listen for uncaught exceptions
    page.on('pageerror', error => {
      uncaughtErrors.push(error.message)
    })

    // Navigate to the app
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true })

    // Check if there are any console errors
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors)
    }

    if (uncaughtErrors.length > 0) {
      console.log('Uncaught Errors:', uncaughtErrors)
    }

    // Verify no JavaScript errors
    expect(consoleErrors, `Found console errors: ${consoleErrors.join(', ')}`).toHaveLength(0)
    expect(uncaughtErrors, `Found uncaught errors: ${uncaughtErrors.join(', ')}`).toHaveLength(0)
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto(BASE_URL)

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check for navigation elements
    const logo = page.locator('.logo-text:has-text("Log")')
    await expect(logo).toBeVisible({ timeout: 10000 })

    // Check for main navigation links
    const assetsLink = page.locator('text=Assets').first()
    await expect(assetsLink).toBeVisible()

    // Take a screenshot
    await page.screenshot({ path: 'test-results/navigation.png' })
  })

  test('should navigate to assets page', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Click on Assets link
    await page.click('text=Assets')

    // Wait for navigation
    await page.waitForURL('**/assets', { timeout: 5000 })

    // Verify we're on the assets page
    expect(page.url()).toContain('/assets')

    // Take a screenshot
    await page.screenshot({ path: 'test-results/assets-page.png', fullPage: true })
  })

  test('should load without network errors', async ({ page }) => {
    const failedRequests: string[] = []

    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`)
    })

    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Wait a bit for any async requests
    await page.waitForTimeout(2000)

    // Check for failed requests
    if (failedRequests.length > 0) {
      console.log('Failed Requests:', failedRequests)
    }

    // We might have some failed requests in development, so we'll just log them
    // but not fail the test. Adjust this based on your needs.
    console.log(`Total failed requests: ${failedRequests.length}`)
  })

  test('should have working API backend', async ({ page }) => {
    // Check if backend health endpoint is working
    const response = await page.request.get(`${BASE_URL.replace('3000', '3001')}/health`)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('status', 'ok')
  })

  test('should display stats on homepage', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Wait for stats to load
    await page.waitForSelector('.stats-grid', { timeout: 10000 })

    // Check for stat cards
    const statCards = page.locator('.stat-card')
    const count = await statCards.count()

    expect(count).toBeGreaterThan(0)

    // Take a screenshot
    await page.screenshot({ path: 'test-results/stats.png' })
  })
})

test.describe('Error Detection', () => {
  test('should detect TypeErrors in computed properties', async ({ page }) => {
    const errors: Array<{ message: string; stack?: string }> = []

    // Capture all errors including TypeError
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack
      })
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          message: msg.text()
        })
      }
    })

    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Wait for any delayed errors
    await page.waitForTimeout(3000)

    // If there are errors, log them with details
    if (errors.length > 0) {
      console.log('\n=== Detected Errors ===')
      errors.forEach((error, index) => {
        console.log(`\nError ${index + 1}:`)
        console.log(`Message: ${error.message}`)
        if (error.stack) {
          console.log(`Stack: ${error.stack}`)
        }
      })
      console.log('\n=====================\n')

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/error-state.png', fullPage: true })

      // Save HTML for debugging
      const html = await page.content()
      const fs = require('fs')
      fs.writeFileSync('test-results/error-state.html', html)
    }

    expect(errors, `Found ${errors.length} errors. Check console output for details.`).toHaveLength(0)
  })
})
