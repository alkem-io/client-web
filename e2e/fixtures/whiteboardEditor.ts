import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page object for the CRD whiteboard editor (Excalidraw on the unified collab
 * provider + the Yjs binding). Encapsulates the canvas interactions the matrix
 * needs: draw a shape, read the element count, save, and the read-only assertion.
 *
 * Selectors use Excalidraw's stable DOM contract (the `.excalidraw` container,
 * the canvas, the toolbar `data-testid`s the fork preserves from upstream) plus
 * the CRD shell's save footer. Where the deployed markup differs, the locator is
 * the single point to adjust.
 */
export class WhiteboardEditor {
  readonly canvas: Locator;
  readonly container: Locator;

  constructor(private readonly page: Page) {
    this.container = page.locator('.excalidraw').first();
    this.canvas = this.container.locator('canvas').first();
  }

  /** Wait for the editor to mount and the initial Yjs sync to settle (no loading overlay). */
  async waitReady(): Promise<void> {
    await expect(this.container).toBeVisible({ timeout: 30_000 });
    // The CRD wrapper shows a LoadingScene overlay until the room reports synced.
    await expect(this.page.getByText(/loading scene/i)).toHaveCount(0, { timeout: 30_000 });
  }

  /** Select the rectangle tool and drag a shape onto the canvas. */
  async drawRectangle(from = { x: 200, y: 200 }, to = { x: 360, y: 320 }): Promise<void> {
    // Excalidraw rectangle tool — keyboard shortcut 'r' is the upstream-stable contract.
    await this.canvas.click({ position: { x: 10, y: 10 } });
    await this.page.keyboard.press('r');
    await this.page.mouse.move(from.x, from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(to.x, to.y, { steps: 8 });
    await this.page.mouse.up();
  }

  /** Move the currently-selected element by a delta (drag). */
  async dragSelected(from: { x: number; y: number }, delta: { dx: number; dy: number }): Promise<void> {
    await this.page.mouse.move(from.x, from.y);
    await this.page.mouse.down();
    await this.page.mouse.move(from.x + delta.dx, from.y + delta.dy, { steps: 8 });
    await this.page.mouse.up();
  }

  /** The number of rendered Excalidraw elements (via the editor's debug global, fork-exposed). */
  async elementCount(): Promise<number> {
    return this.page.evaluate(() => {
      const api = (window as unknown as { h?: { app?: { scene?: { getNonDeletedElements: () => unknown[] } } } }).h;
      return api?.app?.scene?.getNonDeletedElements().length ?? 0;
    });
  }

  /** Assert the canvas is editable (the toolbar is present and not in view-only mode). */
  async expectEditable(): Promise<void> {
    await expect(this.container.locator('.App-toolbar').first()).toBeVisible();
    await expect(this.container).not.toHaveClass(/excalidraw--view-mode/);
  }

  /** Assert the canvas is genuinely read-only (content shown, editing blocked) — distinct from loading. */
  async expectReadOnly(): Promise<void> {
    await expect(this.container).toBeVisible();
    await expect(this.page.getByText(/loading scene/i)).toHaveCount(0);
    await expect(this.container.locator('.App-toolbar')).toHaveCount(0);
  }

  /** Click the CRD save footer (single-user mode) and wait for the persisted acknowledgement. */
  async save(): Promise<void> {
    await this.page.getByRole('button', { name: /^Save$/i }).click();
  }
}
