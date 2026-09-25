import { expect, test } from '../fixtures/authFixture';
import allowedViolations from '../fixtures/cspAllowedViolations.json';
import { type CspViolation, installCspViolationCollector, readCspViolations } from '../fixtures/cspViolations';

/**
 * Live walk of the deployed content-security policy: the document carries the
 * header in the expected mode, and a tour of the surfaces that load
 * third-party or framed content (chat with its silent-SSO frame,
 * notifications, the assistant, a whiteboard) reports no violation beyond the
 * allowlist in cspAllowedViolations.json — every entry there must cite the
 * policy item that admits it.
 *
 * Env: ALKEMIO_BASE_URL + AUTH_TEST_HARNESS_* (e2e/README.md), E2E_MATRIX_URL
 * (the messaging host; the spec is skipped without it), optional
 * E2E_CSP_MODE=enforce and E2E_WHITEBOARD_URL.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, via `pnpm test:e2e`.
 */

const MATRIX_URL = process.env.E2E_MATRIX_URL;
const HEADER = process.env.E2E_CSP_MODE === 'enforce' ? 'content-security-policy' : 'content-security-policy-report-only';
const WHITEBOARD_URL = process.env.E2E_WHITEBOARD_URL;

const isAllowed = (violation: CspViolation) =>
  (allowedViolations as Partial<CspViolation>[]).some(
    allowed =>
      allowed.effectiveDirective === violation.effectiveDirective &&
      violation.blockedURI.startsWith(allowed.blockedURI ?? '')
  );

test.describe('content-security policy', () => {
  test.skip(!MATRIX_URL, 'E2E_MATRIX_URL is unset — point it at the messaging host of the target environment');

  test('the shell carries the policy and a walk reports no violation', async ({ authedPage: page }) => {
    await installCspViolationCollector(page);
    // The first /sync is the settle signal: the silent-SSO frame has done its
    // work and the chat is connected. networkidle never arrives while /sync long-polls.
    const matrixSynced = page.waitForRequest(
      request => request.url().startsWith(`${MATRIX_URL}/_matrix/client/`) && request.url().includes('/sync')
    );

    const response = await page.goto('/');
    const policy = response?.headers()[HEADER] ?? '';
    expect(policy, `${HEADER} header`).toMatch(/connect-src[^;]*/);
    expect(policy.match(/connect-src[^;]*/)?.[0]).toContain(MATRIX_URL);
    expect(policy.match(/frame-src[^;]*/)?.[0]).toContain('https:');

    await page.getByRole('button', { name: 'Open chat' }).click();
    await page.getByRole('button', { name: 'Close chat' }).waitFor();
    await page.getByLabel('Notifications').first().click();
    const assistant = page.getByRole('button', { name: /assistant/i });
    if (await assistant.count()) await assistant.first().click();
    await matrixSynced;
    // The collector lives in the document, so read it before navigating away.
    const violations = await readCspViolations(page);
    if (WHITEBOARD_URL) {
      await page.goto(WHITEBOARD_URL);
      await page.locator('.excalidraw canvas').first().waitFor();
      violations.push(...(await readCspViolations(page)));
    }

    expect(violations.filter(v => !isAllowed(v))).toEqual([]);
  });
});
