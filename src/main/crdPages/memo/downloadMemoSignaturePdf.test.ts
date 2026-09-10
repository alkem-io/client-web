import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error The production module is the GREEN counterpart of this RED contract.
import { downloadMemoSignaturePdf } from './downloadMemoSignaturePdf';

describe('downloadMemoSignaturePdf', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads authenticated bytes through a Blob URL and revokes it', async () => {
    const blob = new Blob(['signed pdf'], { type: 'application/pdf' });
    const fetch = vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });
    const createObjectURL = vi.fn().mockReturnValue('blob:signed-copy');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const anchor = { click, href: '', download: '', remove: vi.fn() } as unknown as HTMLAnchorElement;
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);

    await downloadMemoSignaturePdf({
      url: '/api/private/signed-copy',
      displayName: 'Board decision',
    });

    expect(fetch).toHaveBeenCalledWith('/api/private/signed-copy');
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchor.download).toBe('Board decision.pdf');
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:signed-copy');
  });

  it('rejects a failed authenticated response so the connector can notify the user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(
      downloadMemoSignaturePdf({ url: '/api/private/forbidden', displayName: 'Signed copy.pdf' })
    ).rejects.toThrow('403');
  });
});
