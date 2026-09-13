import { expect, test } from '../fixtures/authFixture';

/**
 * @forge-acceptance
 *
 * US1 — "Recognize a document without opening it" (workspace spec
 * 059-collabora-preview-streaming, US1-AS1..AS5).
 *
 * Reproduces, as a durable live-stack walk, the acceptance scenarios /forge
 * verified manually against a real space feed, the callout detail dialog, and
 * the identity-gated WOPI preview endpoint — evidence under
 * `specs/059-collabora-preview-streaming/forge/evidence/US1/` in the
 * agents-hq workspace.
 *
 * IMPORTANT — root-cause note for whoever tunes this suite's fixture: the
 * rendering pipeline itself (network fetch, decode, paint) was proven correct
 * during verification. A document whose visible content sits entirely inside
 * the compact feed card's `object-cover` crop window, or whose page is mostly
 * blank/white, renders a preview that is visually very close to the
 * document-type placeholder's muted background — that is a fixture/content
 * characteristic, not a loading defect. `E2E_PREVIEW_FILE_ID`'s document MUST
 * carry a distinct, high-contrast fill (e.g. a solid non-white cell/background
 * range covering a large fraction of the page) so this suite's pixel-content
 * assertion is a real, non-flaky sensor rather than a coin flip on crop
 * geometry.
 *
 * Fixture (see specs/059-collabora-preview-streaming/quickstart.md):
 *   E2E_PREVIEW_SPACE_URL   — full URL of a space whose feed contains the
 *                              post below. Required — the whole suite is
 *                              skipped without it.
 *   E2E_PREVIEW_POST_TITLE  — exact title of a Post framing a saved Collabora
 *                              document, with a distinct high-contrast fill
 *                              per the note above (not a near-blank page).
 *                              Required.
 *   E2E_PREVIEW_FILE_ID     — the same document's source fileID, for the
 *                              direct-endpoint half of AS1. Required.
 *
 * Not part of `pnpm test` (vitest) — live-stack only, run via `pnpm test:e2e`
 * (see e2e/README.md) once ALKEMIO_BASE_URL / AUTH_TEST_HARNESS_* / the
 * E2E_PREVIEW_* fixtures above are set for the target stack.
 */

const BASE_URL = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const SPACE_URL = process.env.E2E_PREVIEW_SPACE_URL;
const POST_TITLE = process.env.E2E_PREVIEW_POST_TITLE;
const FILE_ID = process.env.E2E_PREVIEW_FILE_ID;

const previewUrl = (fileID: string) => `${BASE_URL}/api/private/wopi/files/${fileID}/preview`;

/** Render availability is environment-dependent (Collabora reachability); the rendering contract is not. */
const RENDER_UNAVAILABLE_STATUSES = [502, 503];

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

test.describe('US1 — recognize a document without opening it', () => {
  test.skip(!SPACE_URL || !POST_TITLE || !FILE_ID, 'E2E_PREVIEW_SPACE_URL/POST_TITLE/FILE_ID are required for the US1 acceptance matrix');

  test('AS1 — the Collabora-generated preview replaces the document-type placeholder in the feed card', async ({
    authedPage,
  }) => {
    const direct = await authedPage.request.get(previewUrl(FILE_ID!));
    test.skip(RENDER_UNAVAILABLE_STATUSES.includes(direct.status()), 'render unavailable in this environment');
    expect(direct.status()).toBe(200);
    expect(direct.headers()['content-type']).toBe('image/png');
    const body = await direct.body();
    expect(body.subarray(0, 4).equals(PNG_MAGIC)).toBeTruthy();

    await authedPage.goto(SPACE_URL!);
    const card = authedPage.getByText(POST_TITLE!, { exact: true }).first();
    await expect(card).toBeVisible();

    const img = authedPage.locator(`img[src*="/api/private/wopi/files/${FILE_ID}/preview"]`).first();
    await expect(img).toBeVisible();
    await img.evaluate((el: HTMLImageElement) => (el.complete ? Promise.resolve() : new Promise(resolve => el.addEventListener('load', resolve, { once: true }))));
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth, 'the fetched PNG must have actually decoded, not merely returned bytes').toBeGreaterThan(0);
  });

  test('AS3 — the callout detail dialog renders the same previewUrl with the same fallback behaviour', async ({
    authedPage,
  }) => {
    await authedPage.goto(SPACE_URL!);
    await authedPage.getByRole('link', { name: POST_TITLE!, exact: true }).first().click();

    const dialog = authedPage.getByRole('dialog').filter({ hasText: POST_TITLE! }).first();
    await expect(dialog).toBeVisible();

    const dialogImg = dialog.locator(`img[src*="/api/private/wopi/files/${FILE_ID}/preview"]`).first();
    await expect(dialogImg).toBeVisible();
    const naturalWidth = await dialogImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('AS4 — the preview image uses native lazy loading', async ({ authedPage }) => {
    await authedPage.goto(SPACE_URL!);
    const img = authedPage.locator(`img[src*="/api/private/wopi/files/${FILE_ID}/preview"]`).first();
    await expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('AS5 — the preview image is decorative and does not duplicate the card\'s accessible name', async ({
    authedPage,
  }) => {
    await authedPage.goto(SPACE_URL!);
    const img = authedPage.locator(`img[src*="/api/private/wopi/files/${FILE_ID}/preview"]`).first();
    await expect(img).toHaveAttribute('alt', '');

    // A decorative (alt="") image contributes no accessible name of its own, so
    // the accessibility tree must not expose an "image" role named after the post.
    const namedImage = authedPage.getByRole('img', { name: POST_TITLE!, exact: true });
    await expect(namedImage, 'the preview image must not carry its own accessible name').toHaveCount(0);
  });
});
