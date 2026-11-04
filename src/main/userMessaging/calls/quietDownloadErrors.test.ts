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
    console.error(MESSAGE);
    expect(sink).toHaveBeenLastCalledWith(MESSAGE);
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
  });

  it('filters again for a call opened after one was replaced over it', () => {
    quietDownloadErrors();
    const replacement = vi.fn<(...args: unknown[]) => void>();
    console.error = replacement;
    const release = quietDownloadErrors();
    console.error(MESSAGE);
    expect(replacement).not.toHaveBeenCalled();
    release();
    expect(console.error).toBe(replacement);
  });
});
