import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadMemoSignaturePdf } from './downloadMemoSignaturePdf';

describe('downloadMemoSignaturePdf', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads authenticated bytes and keeps the Blob URL alive long enough for the browser', async () => {
    vi.useFakeTimers();
    const blob = new Blob(['signed pdf'], { type: 'application/pdf' });
    const fetch = vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) });
    const createObjectURL = vi.fn().mockReturnValue('blob:signed-copy');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const remove = vi.fn();
    const anchor = { click, href: '', download: '', remove } as unknown as HTMLAnchorElement;
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);

    await downloadMemoSignaturePdf({
      url: '/api/private/signed-copy',
      displayName: 'Board decision.pdf',
    });

    expect(fetch).toHaveBeenCalledWith('/api/private/signed-copy', { credentials: 'include' });
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchor.download).toBe('Board decision.pdf');
    expect(document.body.appendChild).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(29_999);
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:signed-copy');
  });

  it('rejects a failed authenticated response so the connector can notify the user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(
      downloadMemoSignaturePdf({ url: '/api/private/forbidden', displayName: 'Signed copy.pdf' })
    ).rejects.toThrow('403');
  });

  it('removes the temporary anchor and revokes the Blob URL when the browser download throws', async () => {
    vi.useFakeTimers();
    const blob = new Blob(['signed pdf'], { type: 'application/pdf' });
    const remove = vi.fn();
    const revokeObjectURL = vi.fn();
    const anchor = {
      click: vi.fn(() => {
        throw new Error('browser blocked download');
      }),
      href: '',
      download: '',
      remove,
    } as unknown as HTMLAnchorElement;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }));
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:signed-copy'), revokeObjectURL });
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);

    await expect(
      downloadMemoSignaturePdf({ url: '/api/private/signed-copy', displayName: 'Signed copy' })
    ).rejects.toThrow('browser blocked download');

    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:signed-copy');
  });
});
