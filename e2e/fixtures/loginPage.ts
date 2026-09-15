import { type Page } from '@playwright/test';

const DEFAULT_BASE_URL = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const DEFAULT_PASSWORD = process.env.AUTH_TEST_HARNESS_PASSWORD || 'change_me';

/**
 * Drives the OIDC/BFF login flow through the real UI (mirrors the test-suites
 * LoginPage). One instance per browser context, so two contexts log in as two
 * accounts for the multi-user rows.
 */
export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly baseUrl: string = DEFAULT_BASE_URL
  ) {}

  async goto(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async acceptCookies(): Promise<void> {
    const cookieButton = this.page.getByRole('button', { name: /Accept (all|All) Cookies/i });
    if (await cookieButton.isVisible({ timeout: 8_000 }).catch(() => false)) {
      await cookieButton.click();
    }
  }

  async login(
    email: string = process.env.AUTH_TEST_HARNESS_EMAIL || 'admin@alkem.io',
    password: string = DEFAULT_PASSWORD
  ): Promise<void> {
    await this.goto();
    // The CRD SPA renders its header (with the Log in link) after initial load; give it
    // a beat, dismiss cookies (a modal that otherwise keeps the header out of the a11y
    // tree), then settle before locating the link. Mirrors the working smoke sequence.
    await this.page.waitForTimeout(2500);
    await this.acceptCookies();
    await this.page.waitForTimeout(1000);
    const loginLink = this.page.getByRole('link', { name: /log ?in|sign ?in/i }).first();
    if (await loginLink.isVisible({ timeout: 20_000 }).catch(() => false)) {
      await loginLink.click();
    } else {
      await this.page.getByTestId('PersonIcon').click();
      await this.page.getByRole('menuitem', { name: /Log In \| Sign Up/i }).click();
    }
    await this.page.waitForURL(/.*login.*/);
    await this.page.getByRole('textbox', { name: /E-Mail/i }).fill(email);
    await this.page.getByRole('textbox', { name: /Password/i }).fill(password);
    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await this.page.waitForURL(/.*home.*/);
  }
}
