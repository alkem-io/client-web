import { afterEach, describe, expect, test, vi } from 'vitest';
import { downloadUrlAsFile } from './downloadUrlAsFile';

describe('downloadUrlAsFile', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('saves the fetched blob under the given file name, then releases it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Blob(['x']), { status: 200 })));
    // jsdom does not implement object URLs.
    URL.createObjectURL ??= () => '';
    URL.revokeObjectURL ??= () => {};
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:media');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('clip.mp4');
      expect(this.href).toBe('blob:media');
    });

    await downloadUrlAsFile('https://alkem.io/media/1', 'clip.mp4');

    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:media');
  });

  test('rejects without saving when the server refuses the file', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    await expect(downloadUrlAsFile('https://alkem.io/media/1', 'clip.mp4')).rejects.toThrow();
    expect(click).not.toHaveBeenCalled();
  });
});
