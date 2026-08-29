import { describe, expect, it, vi } from 'vitest';
import { updateMemoMarkdownCache } from './CrdMemoDialog';

describe('updateMemoMarkdownCache', () => {
  it('does not replace cached content when the editor has not mounted', async () => {
    const writeMarkdown = vi.fn();

    await updateMemoMarkdownCache(null, writeMarkdown);

    expect(writeMarkdown).not.toHaveBeenCalled();
  });
});
