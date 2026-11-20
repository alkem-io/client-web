import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadPdf, PdfDownloadError, parseContentDispositionFilename } from './downloadPdf';

const noHeaders = { get: () => null };

const stubBrowserDownload = () => {
  const anchor = { click: vi.fn(), href: '', download: '', remove: vi.fn() } as unknown as HTMLAnchorElement;
  vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:pdf'), revokeObjectURL: vi.fn() });
  vi.spyOn(document, 'createElement').mockReturnValue(anchor);
  vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);
  return anchor;
};

describe('downloadPdf', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads authenticated bytes and keeps the Blob URL alive long enough for the browser', async () => {
    vi.useFakeTimers();
    const blob = new Blob(['signed pdf'], { type: 'application/pdf' });
    const fetch = vi.fn().mockResolvedValue({ ok: true, headers: noHeaders, blob: () => Promise.resolve(blob) });
    const createObjectURL = vi.fn().mockReturnValue('blob:signed-copy');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const remove = vi.fn();
    const anchor = { click, href: '', download: '', remove } as unknown as HTMLAnchorElement;
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);

    await downloadPdf({
      url: '/api/private/signed-copy',
      filename: 'Board decision.pdf',
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

    await expect(downloadPdf({ url: '/api/private/forbidden', filename: 'Signed copy.pdf' })).rejects.toThrow('403');
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
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, headers: noHeaders, blob: () => Promise.resolve(blob) })
    );
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:signed-copy'), revokeObjectURL });
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => node);

    await expect(downloadPdf({ url: '/api/private/signed-copy', filename: 'Signed copy' })).rejects.toThrow(
      'browser blocked download'
    );

    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:signed-copy');
  });

  it('uses the Content-Disposition filename when no filename is given', async () => {
    const anchor = stubBrowserDownload();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'attachment; filename="board-decision-q4-2026-10-19.pdf"' },
        blob: () => Promise.resolve(new Blob(['pdf'])),
      })
    );

    await downloadPdf({ url: '/api/private/rest/memo/abc/pdf' });

    expect(anchor.download).toBe('board-decision-q4-2026-10-19.pdf');
  });

  it.each([
    ['missing', null],
    ['unparsable', 'attachment'],
  ])('falls back to memo.pdf when the header is %s', async (_label, header) => {
    const anchor = stubBrowserDownload();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => header },
        blob: () => Promise.resolve(new Blob(['pdf'])),
      })
    );

    await downloadPdf({ url: '/api/private/rest/memo/abc/pdf' });

    expect(anchor.download).toBe('memo.pdf');
  });

  it('passes the abort signal to fetch', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();

    await expect(downloadPdf({ url: '/api/private/memo/pdf', signal: controller.signal })).rejects.toThrow();

    expect(fetch).toHaveBeenCalledWith('/api/private/memo/pdf', {
      credentials: 'include',
      signal: controller.signal,
    });
  });

  it('rejects with the status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    const result = downloadPdf({ url: '/api/private/rest/memo/abc/pdf' });

    await expect(result).rejects.toBeInstanceOf(PdfDownloadError);
    await expect(result).rejects.toMatchObject({ status: 429 });
  });
});

describe('parseContentDispositionFilename', () => {
  it.each([
    ['attachment; filename="board-decision-2026-10-19.pdf"', 'board-decision-2026-10-19.pdf'],
    ['attachment; filename=memo-2026-10-19.pdf', 'memo-2026-10-19.pdf'],
    ['attachment; filename*=UTF-8\'\'r%C3%A9sum%C3%A9.pdf; filename="resume.pdf"', 'resume.pdf'],
    ["attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf", undefined],
    [null, undefined],
    ['', undefined],
    ['attachment; filename=""', undefined],
  ])('parses %j as %j', (header, expected) => {
    expect(parseContentDispositionFilename(header)).toBe(expected);
  });
});
