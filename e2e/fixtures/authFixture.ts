import { type Browser, type BrowserContext, type Page, test as base } from '@playwright/test';
import { LoginPage } from './loginPage';

const PRIMARY_EMAIL = process.env.AUTH_TEST_HARNESS_EMAIL || 'admin@alkem.io';
const SECONDARY_EMAIL = process.env.AUTH_TEST_HARNESS_EMAIL_2 || 'community.admin@alkem.io';
const READONLY_EMAIL = process.env.E2E_READONLY_USER_EMAIL;

type AuthenticatedSession = { context: BrowserContext; page: Page; close: () => Promise<void> };

type AuthFixtures = {
  /** A page already logged in as the primary account. */
  authedPage: Page;
  /** Opens a second, independently-authenticated context (the secondary account). */
  secondUser: () => Promise<AuthenticatedSession>;
  /** Opens a new primary-account context, with no live editor/session state from the source page. */
  freshPrimaryUser: () => Promise<AuthenticatedSession>;
  /** Opens the explicitly configured account that can read, but cannot update, the test document. */
  readonlyUser: () => Promise<AuthenticatedSession>;
};

/**
 * Authenticated-session fixtures for the acceptance matrix. `authedPage` logs in
 * as the primary account; `secondUser()` spins up a second browser context for
 * the two-user convergence / per-property-merge / presence rows — two real
 * sessions on the same document, the way the unified collaboration service is
 * exercised in production.
 */
export const test = base.extend<AuthFixtures>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await new LoginPage(page).login(PRIMARY_EMAIL);
    await use(page);
    await context.close();
  },

  secondUser: async ({ browser }, use) => {
    const opened: BrowserContext[] = [];
    const factory = async () => {
      const context = await (browser as Browser).newContext();
      opened.push(context);
      const page = await context.newPage();
      await new LoginPage(page).login(SECONDARY_EMAIL);
      return { context, page, close: async () => context.close() };
    };
    await use(factory);
    await Promise.all(opened.map(c => c.close()));
  },

  freshPrimaryUser: async ({ browser }, use) => {
    const opened: BrowserContext[] = [];
    await use(async () => {
      const context = await (browser as Browser).newContext();
      opened.push(context);
      const page = await context.newPage();
      await new LoginPage(page).login(PRIMARY_EMAIL);
      return { context, page, close: async () => context.close() };
    });
    await Promise.all(opened.map(c => c.close()));
  },

  readonlyUser: async ({ browser }, use) => {
    const opened: BrowserContext[] = [];
    await use(async () => {
      if (!READONLY_EMAIL) throw new Error('E2E_READONLY_USER_EMAIL is required for the full acceptance matrix');
      const context = await (browser as Browser).newContext();
      opened.push(context);
      const page = await context.newPage();
      await new LoginPage(page).login(READONLY_EMAIL);
      return { context, page, close: async () => context.close() };
    });
    await Promise.all(opened.map(c => c.close()));
  },
});

export const expect = test.expect;
