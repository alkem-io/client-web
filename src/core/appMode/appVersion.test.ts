import { afterEach, describe, expect, it, vi } from 'vitest';
import { appVersion } from './appVersion';

const withUserAgent = (userAgent: string) => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);

describe('appVersion', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads the version from the shell marker', () => {
    withUserAgent(
      'Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile Safari/537.36 AlkemioApp/0.5.0 (android; production)'
    );
    expect(appVersion()).toBe('0.5.0');
  });

  it('keeps a pre-release suffix', () => {
    withUserAgent('Mozilla/5.0 (iPhone) AlkemioApp/0.6.0-rc.1 (ios; sandbox)');
    expect(appVersion()).toBe('0.6.0-rc.1');
  });

  it('is undefined without the marker', () => {
    withUserAgent('Mozilla/5.0 (Macintosh) Chrome/130.0 Safari/537.36');
    expect(appVersion()).toBeUndefined();
  });
});
