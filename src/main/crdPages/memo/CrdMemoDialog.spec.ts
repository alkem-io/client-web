import { describe, expect, it, vi } from 'vitest';
import { updateMemoMarkdownCache } from '@/main/crdPages/memo/CrdMemoDialog';

describe('updateMemoMarkdownCache', () => {
  it('does not replace cached content when the editor has not mounted', async () => {
    const writeMarkdown = vi.fn();

    await updateMemoMarkdownCache(null, writeMarkdown);

    expect(writeMarkdown).not.toHaveBeenCalled();
  });

  it('does not read or replace content for a look-only session', async () => {
    const editor = { getHTML: vi.fn(() => '<p>unchanged</p>') };
    const writeMarkdown = vi.fn();

    await updateMemoMarkdownCache(editor, writeMarkdown, false);

    expect(editor.getHTML).not.toHaveBeenCalled();
    expect(writeMarkdown).not.toHaveBeenCalled();
  });
});
