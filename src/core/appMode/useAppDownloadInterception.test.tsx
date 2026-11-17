import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv } from '@/core/utils/csv/downloadCsv';
import enJson from '@/crd/i18n/common/common.en.json';
import { MAX_APP_DOWNLOAD_BYTES, useAppDownloadInterception } from './useAppDownloadInterception';

const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notify,
}));

// `t` resolves against the real English resource, so the toast assertions check the shipped string.
vi.mock('react-i18next', async () => {
  const en = (await import('@/crd/i18n/common/common.en.json')).default as unknown as Record<string, unknown>;
  const t = (key: string) =>
    key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], en);
  return { useTranslation: () => ({ t }) };
});

const FAILED = 'The file could not be downloaded.';
const originalClick = HTMLAnchorElement.prototype.click;

const Probe = () => {
  useAppDownloadInterception();
  return null;
};

const save = vi.fn<(options: { fileName: string; mimeType: string; data: string }) => Promise<void>>();
const fetchMock = vi.fn();

/** jsdom's `Response` stringifies a jsdom `Blob`, so the mock is shaped by hand (A-9d). */
const okResponse = (blob: Blob) => ({ ok: true, status: 200, blob: () => Promise.resolve(blob) });

const installPlugin = () => {
  window.Capacitor = { isPluginAvailable: name => name === 'FileSave', Plugins: { FileSave: { save } } };
};

/** Clicks `target` and reports whether a listener prevented the default; then suppresses jsdom navigation. */
const click = (target: Element): boolean => {
  let prevented = false;
  const observe = (event: Event) => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  window.addEventListener('click', observe);
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  window.removeEventListener('click', observe);
  return prevented;
};

const downloadLink = (href = 'https://app.test/f.png', fileName = 'f.png') => {
  const a = document.createElement('a');
  a.href = href;
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  return a;
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('useAppDownloadInterception', () => {
  beforeEach(() => {
    notify.mockReset();
    save.mockReset().mockResolvedValue(undefined);
    fetchMock.mockReset().mockResolvedValue(okResponse(new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })));
    vi.stubGlobal('fetch', fetchMock);
    installPlugin();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete window.Capacitor;
    vi.unstubAllGlobals();
  });

  it('ships the real English failure string (A-6)', () => {
    expect(enJson.appDownload.failed).toBe(FAILED);
  });

  it('(a) saves a declarative download link through the plugin instead of navigating', async () => {
    render(<Probe />);
    const a = downloadLink();

    expect(click(a)).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('https://app.test/f.png');
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledWith({
      fileName: 'f.png',
      mimeType: 'image/png',
      data: Buffer.from([1, 2, 3]).toString('base64'),
    });
  });

  it('(b) is inert without the shell plugin', () => {
    delete window.Capacitor;
    const { unmount } = render(<Probe />);
    expect(click(downloadLink())).toBe(false);
    unmount();

    window.Capacitor = { isPluginAvailable: () => false, Plugins: { FileSave: { save } } };
    render(<Probe />);
    expect(click(downloadLink())).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('(c) notifies once on a failed fetch and once on a rejected save, and recovers after each (A-9b)', async () => {
    render(<Probe />);
    const a = downloadLink();

    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, blob: () => Promise.resolve(new Blob()) });
    click(a);
    await vi.waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
    expect(notify).toHaveBeenCalledWith(FAILED, 'error');
    expect(save).not.toHaveBeenCalled();

    await flush();
    click(a);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));

    notify.mockReset();
    save.mockRejectedValueOnce(new Error('write failed'));
    await flush();
    click(a);
    await vi.waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
    expect(notify).toHaveBeenCalledWith(FAILED, 'error');

    await flush();
    click(a);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(3));
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('(d) ignores an anchor without `download`', () => {
    render(<Probe />);
    const a = document.createElement('a');
    a.href = 'https://app.test/page';
    document.body.appendChild(a);

    expect(click(a)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('(e) intercepts a click on a child of the anchor', async () => {
    render(<Probe />);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    downloadLink().appendChild(svg);

    expect(click(svg)).toBe(true);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  });

  it('(f) stops intercepting after unmount', () => {
    const { unmount } = render(<Probe />);
    unmount();

    expect(click(downloadLink())).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('(g) sends an empty payload for a zero-byte file', async () => {
    fetchMock.mockResolvedValue(okResponse(new Blob([])));
    render(<Probe />);
    click(downloadLink());

    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0].data).toBe('');
  });

  it('(h) refuses a file over the size limit before saving', async () => {
    fetchMock.mockResolvedValue(okResponse(new Blob([new Uint8Array(MAX_APP_DOWNLOAD_BYTES + 1)])));
    render(<Probe />);
    click(downloadLink());

    await vi.waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
    expect(notify).toHaveBeenCalledWith(FAILED, 'error');
    expect(save).not.toHaveBeenCalled();
  });

  it('(i) runs one save at a time', async () => {
    let finish: () => void = () => {};
    save.mockImplementationOnce(() => new Promise<void>(resolve => (finish = resolve)));
    render(<Probe />);
    const a = downloadLink();

    click(a);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(click(a)).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    finish();
    await flush();
    click(a);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  });

  it('(j) catches the unedited downloadCsv (attached programmatic anchor)', async () => {
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:csv', revokeObjectURL: vi.fn() }));
    render(<Probe />);

    downloadCsv('a,b', 'x.csv');

    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0].fileName).toBe('x.csv');
  });

  it('(k) catches a detached anchor clicked programmatically, keeps its own listener and leaves it where it was', async () => {
    render(<Probe />);
    const own = vi.fn();

    const parent = document.createElement('div'); // a detached parent must keep its child
    const a = parent.appendChild(document.createElement('a'));
    a.download = 'm.md';
    a.href = 'https://app.test/m.md';
    a.addEventListener('click', own);
    a.click();

    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0].fileName).toBe('m.md');
    expect(own).toHaveBeenCalledTimes(1);
    expect(a.isConnected).toBe(false);
    expect(a.parentNode).toBe(parent);

    await flush();
    const b = document.createElement('a');
    b.setAttribute('download', 'n.md');
    b.href = 'https://app.test/n.md';
    b.click();

    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1][0].fileName).toBe('n.md');
  });

  it('(l) leaves a detached anchor without `download` alone', () => {
    render(<Probe />);
    const a = document.createElement('a');
    a.href = 'https://app.test/page';
    let attached: boolean | undefined;
    a.addEventListener('click', event => {
      attached = document.body.contains(a);
      event.preventDefault(); // jsdom would otherwise attempt (and log) a navigation
    });

    a.click();

    expect(attached).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('(m) touches HTMLAnchorElement.prototype.click only while mounted with the plugin', () => {
    delete window.Capacitor;
    const browser = render(<Probe />);
    expect(HTMLAnchorElement.prototype.click).toBe(originalClick);
    browser.unmount();

    installPlugin();
    const app = render(<Probe />);
    expect(HTMLAnchorElement.prototype.click).not.toBe(originalClick);
    app.unmount();
    expect(HTMLAnchorElement.prototype.click).toBe(originalClick);
  });

  it('(n) treats a resolved save (saved or cancelled) as success', async () => {
    render(<Probe />);
    const a = downloadLink();

    click(a);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    await flush();
    expect(notify).not.toHaveBeenCalled();

    click(a);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  });
});
