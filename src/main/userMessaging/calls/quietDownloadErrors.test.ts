import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { quietDownloadErrors } from './quietDownloadErrors';

const MESSAGE = 'error while downloading a file';

describe('quietDownloadErrors', () => {
  const original = console.error;
  let sink: ReturnType<typeof vi.fn<(...args: unknown[]) => void>>;

  beforeEach(() => {
    sink = vi.fn<(...args: unknown[]) => void>();
    console.error = sink;
  });
  afterEach(() => {
    console.error = original;
  });

  it('drops exactly the failed-download message and passes everything else on with its this and arguments', () => {
    const release = quietDownloadErrors();
    const failure = new Error('500');
    console.error(MESSAGE, failure);
    console.error(`${MESSAGE}!`, failure);
    console.error(failure, MESSAGE);
    const target = { name: 'caller' };
    console.error.call(target, 'other', 1, 2);
    expect(sink.mock.calls).toEqual([
      [`${MESSAGE}!`, failure],
      [failure, MESSAGE],
      ['other', 1, 2],
    ]);
    expect(sink.mock.contexts[2]).toBe(target);
    release();
    expect(console.error).toBe(sink);
  });

  it('stays until the last of two open calls releases, and a repeated release counts once', () => {
    const first = quietDownloadErrors();
    const second = quietDownloadErrors();
    first();
    first();
    console.error(MESSAGE);
    expect(sink).not.toHaveBeenCalled();
    second();
    expect(console.error).toBe(sink);
    console.error(MESSAGE);
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it('never removes a wrapper installed over it, and passes everything through once released', () => {
    const release = quietDownloadErrors();
    const ours = console.error;
    const later = vi.fn((...args: unknown[]) => ours(...args));
    console.error = later;
    release();
    expect(console.error).toBe(later);
    console.error(MESSAGE);
    expect(sink).toHaveBeenCalledWith(MESSAGE);

    // Opening another call reuses the filter still in the chain instead of stacking a second one.
    const again = quietDownloadErrors();
    console.error(MESSAGE);
    expect(sink).toHaveBeenCalledTimes(1);
    again();
    // Once the later wrapper is gone, the filter's own last release restores the original.
    console.error = ours;
    quietDownloadErrors()();
    expect(console.error).toBe(sink);
  });
});
