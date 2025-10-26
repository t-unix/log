# End-to-End Tests

This directory contains headless browser tests using Playwright to verify the application works correctly and catch JavaScript errors.

## Setup

1. Install dependencies:
```bash
cd e2e-tests
npm install
npm run install-browsers
```

## Running Tests

Make sure your application is running first:
```bash
# In the root directory
docker compose up -d
# Or for local development
make dev
```

Then run the tests:

```bash
# Run all tests (headless)
npm test

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests with browser visible
npm run test:headed

# Run specific test file
npx playwright test app.spec.ts

# Run tests and generate HTML report
npm test -- --reporter=html
```

## What the Tests Check

1. **Console Errors**: Detects JavaScript errors, TypeErrors, and other console errors
2. **Navigation**: Verifies all navigation links work correctly
3. **API Health**: Checks backend API is responding
4. **Page Load**: Ensures pages load without network failures
5. **UI Elements**: Verifies key UI components are visible

## Test Results

After running tests:
- Screenshots are saved to `test-results/`
- HTML reports are in `test-results/html-report/`
- Failed test artifacts include screenshots, videos, and traces

## Viewing Reports

```bash
npx playwright show-report test-results/html-report
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: |
    cd e2e-tests
    npm install
    npx playwright install --with-deps chromium

- name: Run tests
  run: |
    cd e2e-tests
    npm test

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-results
    path: e2e-tests/test-results/
```

## Debugging Failed Tests

When a test fails:

1. Check `test-results/*.png` for screenshots
2. Review `test-results/error-state.html` for the page state
3. Run with `--headed` to see browser interactions
4. Use `--debug` to step through tests:
   ```bash
   npx playwright test --debug
   ```

## Common Issues

### Connection Refused
- Make sure the app is running on http://localhost:3000
- Check `docker compose ps` to verify containers are up

### Timeout Errors
- Increase timeout in test or config
- Check network tab for slow API responses

### Element Not Found
- Verify the selector is correct
- Check if element is hidden or not yet rendered
- Use `page.waitForSelector()` with appropriate timeout
