import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PdfDownloadError } from './downloadPdf';
import { memoPdfDownloadPath, useMemoPdfDownload } from './useMemoPdfDownload';

const mocks = vi.hoisted(() => ({
  downloadPdf: vi.fn(),
  notify: vi.fn(),
}));

vi.mock('./downloadPdf', async importOriginal => ({
  ...(await importOriginal<typeof import('./downloadPdf')>()),
  downloadPdf: mocks.downloadPdf,
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mocks.notify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

describe('memoPdfDownloadPath', () => {
  it('matches the server contract path', () => {
    expect(memoPdfDownloadPath('abc')).toBe('/api/private/rest/memo/abc/pdf');
  });

  it('encodes the memo id', () => {
    expect(memoPdfDownloadPath('a/b c')).toBe('/api/private/rest/memo/a%2Fb%20c/pdf');
  });
});

describe('useMemoPdfDownload', () => {
  beforeEach(() => {
    mocks.downloadPdf.mockReset();
    mocks.notify.mockReset();
  });

  it('downloads from the contract path without a client-side filename', async () => {
    mocks.downloadPdf.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMemoPdfDownload('memo-1'));

    await act(() => result.current.download());

    expect(mocks.downloadPdf).toHaveBeenCalledOnce();
    expect(mocks.downloadPdf).toHaveBeenCalledWith({ url: '/api/private/rest/memo/memo-1/pdf' });
    expect(mocks.notify).not.toHaveBeenCalled();
  });

  it('is busy while the download is in flight and ignores a second call', async () => {
    let resolve: (() => void) | undefined;
    mocks.downloadPdf.mockReturnValue(
      new Promise<void>(r => {
        resolve = r;
      })
    );
    const { result } = renderHook(() => useMemoPdfDownload('memo-1'));
    expect(result.current.downloading).toBe(false);

    let first: Promise<void> | undefined;
    act(() => {
      first = result.current.download();
    });
    await waitFor(() => expect(result.current.downloading).toBe(true));

    await act(() => result.current.download());
    expect(mocks.downloadPdf).toHaveBeenCalledOnce();

    await act(async () => {
      resolve?.();
      await first;
    });
    expect(result.current.downloading).toBe(false);
  });

  it('does nothing without a memo id', async () => {
    const { result } = renderHook(() => useMemoPdfDownload(undefined));

    await act(() => result.current.download());

    expect(mocks.downloadPdf).not.toHaveBeenCalled();
  });

  it.each([
    ['429', new PdfDownloadError(429), 'memo.downloadPdf.busy', 'warning'],
    ['503', new PdfDownloadError(503), 'memo.downloadPdf.busy', 'warning'],
    ['422', new PdfDownloadError(422), 'memo.downloadPdf.tooLarge', 'error'],
    ['500', new PdfDownloadError(500), 'memo.downloadPdf.failed', 'error'],
    ['403', new PdfDownloadError(403), 'memo.downloadPdf.failed', 'error'],
    ['a network TypeError', new TypeError('Failed to fetch'), 'memo.downloadPdf.failed', 'error'],
  ])('maps %s to its toast and resets the busy state', async (_label, error, key, severity) => {
    mocks.downloadPdf.mockRejectedValue(error);
    const { result } = renderHook(() => useMemoPdfDownload('memo-1'));

    await act(() => result.current.download());

    expect(mocks.notify).toHaveBeenCalledOnce();
    expect(mocks.notify).toHaveBeenCalledWith(key, severity);
    expect(result.current.downloading).toBe(false);
  });
});
