import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAlkemioCookies } from './useAlkemioCookies';

// Real react-cookie: it keeps a refused write in memory, so the choice must be read back from
// the browser or the banner would close on a save that failed.
const wrapper = ({ children }: { children: ReactNode }) => <CookiesProvider>{children}</CookiesProvider>;

const save = (analysis: boolean) => {
  const { result } = renderHook(() => useAlkemioCookies(), { wrapper });
  let saved = false;
  act(() => {
    saved = result.current.saveConsent(analysis);
  });
  return { saved, consent: result.current.consent };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAlkemioCookies in the browser', () => {
  it('reads a kept write as the choice', () => {
    expect(save(true)).toEqual({ saved: true, consent: { decided: true, analysis: true } });
  });

  it('stays undecided after a write the browser refused', () => {
    vi.spyOn(document, 'cookie', 'get').mockReturnValue('');
    vi.spyOn(document, 'cookie', 'set').mockImplementation(() => {});
    expect(save(true)).toEqual({ saved: false, consent: { decided: false, analysis: false } });
  });
});
