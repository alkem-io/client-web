import { expect, type Page } from '@playwright/test';

/**
 * Navigation + creation helpers for memo / whiteboard callouts in a space. The
 * matrix creates content through the normal UI flow (the headline correctness
 * promise — created content must appear on reopen), so these drive the real
 * "add callout" dialog rather than seeding via the API.
 *
 * The target space is supplied via E2E_SPACE_URL (a space the test accounts can
 * contribute to on the deployed stack). Selectors follow the CRD callout flow.
 */
const SPACE_URL = process.env.E2E_SPACE_URL || '/';

export type CreatedCallout = { url: string };

async function openSpaceCollaboration(page: Page): Promise<void> {
  await page.goto(SPACE_URL);
  // Land on the space's collaboration / community area where callouts are added.
  await expect(page.getByRole('button', { name: /Add (a )?(callout|block|contribution)/i }).first()).toBeVisible({
    timeout: 30_000,
  });
}

/**
 * Create a memo callout with no content (the caller types into the editor). The
 * returned URL deep-links to the callout so a fresh session can reopen it.
 */
export async function createMemoCallout(page: Page, displayName: string): Promise<CreatedCallout> {
  await openSpaceCollaboration(page);
  await page.getByRole('button', { name: /Add (a )?(callout|block)/i }).first().click();
  await page.getByRole('option', { name: /Memo|Note|Document/i }).click();
  await page.getByRole('textbox', { name: /Title|Name/i }).first().fill(displayName);
  await page.getByRole('button', { name: /^(Create|Save|Add)$/i }).click();
  await expect(page.getByText(displayName).first()).toBeVisible({ timeout: 30_000 });
  return { url: page.url() };
}

/**
 * Create a whiteboard callout with no content (the caller draws into the canvas).
 */
export async function createWhiteboardCallout(page: Page, displayName: string): Promise<CreatedCallout> {
  await openSpaceCollaboration(page);
  await page.getByRole('button', { name: /Add (a )?(callout|block)/i }).first().click();
  await page.getByRole('option', { name: /Whiteboard/i }).click();
  await page.getByRole('textbox', { name: /Title|Name/i }).first().fill(displayName);
  await page.getByRole('button', { name: /^(Create|Save|Add)$/i }).click();
  await expect(page.getByText(displayName).first()).toBeVisible({ timeout: 30_000 });
  return { url: page.url() };
}

/** Open a previously-created memo/whiteboard callout by its display name from the space. */
export async function openCalloutByName(page: Page, displayName: string): Promise<void> {
  await page.goto(SPACE_URL);
  await page.getByText(displayName).first().click();
}
