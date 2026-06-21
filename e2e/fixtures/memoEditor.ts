import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page object for the CRD memo editor (Tiptap on the unified collab provider).
 * Encapsulates typing, reading the rendered text, and the presence/read-only
 * assertions the matrix needs.
 */
export class MemoEditor {
  readonly editor: Locator;

  constructor(private readonly page: Page) {
    // Tiptap renders a ProseMirror contenteditable.
    this.editor = page.locator('.ProseMirror').first();
  }

  /** Wait for the editor to mount once the provider is connected + the initial sync done. */
  async waitReady(): Promise<void> {
    await expect(this.editor).toBeVisible({ timeout: 30_000 });
    await expect(this.editor).toHaveAttribute('contenteditable', 'true', { timeout: 30_000 });
  }

  async type(text: string): Promise<void> {
    await this.editor.click();
    await this.editor.pressSequentially(text);
  }

  async text(): Promise<string> {
    return (await this.editor.innerText()).trim();
  }

  async expectContains(text: string): Promise<void> {
    await expect(this.editor).toContainText(text, { timeout: 15_000 });
  }

  /** Assert the editor is editable (not the genuine read-only state). */
  async expectEditable(): Promise<void> {
    await expect(this.editor).toHaveAttribute('contenteditable', 'true');
  }

  /** Assert genuine read-only — content visible, editing blocked, distinct from connecting. */
  async expectReadOnly(): Promise<void> {
    await expect(this.editor).toBeVisible();
    await expect(this.editor).toHaveAttribute('contenteditable', 'false');
  }

  /** Presence: at least one remote collaborator avatar shows in the memo footer. */
  async expectPresence(): Promise<void> {
    await expect(this.page.getByTestId('memo-collab-footer')).toBeVisible({ timeout: 15_000 });
  }
}
