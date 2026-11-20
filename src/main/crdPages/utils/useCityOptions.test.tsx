import { act, renderHook, waitFor } from '@testing-library/react';
import i18next, { type i18n as I18n } from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCityOptions } from './useCityOptions';

const BUNDLES: Record<string, Record<string, Record<string, string>>> = {
  en: { NL: { the_hague: 'The Hague' }, GB: { london: 'London' } },
  // `london` missing on purpose — must fall back to English.
  es: { NL: { the_hague: 'La Haya' }, GB: {} },
};

let instance: I18n;
let read: ReturnType<typeof vi.fn>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nextProvider i18n={instance}>{children}</I18nextProvider>
);

beforeEach(async () => {
  read = vi.fn((lng: string, _ns: string, cb: (err: Error | null, data?: unknown) => void) => cb(null, BUNDLES[lng]));
  instance = i18next.createInstance();
  await instance
    .use(initReactI18next)
    .use({ type: 'backend', init: () => {}, read })
    .init({ lng: 'es', fallbackLng: 'en', ns: [], resources: undefined, partialBundledLanguages: true });
});

describe('useCityOptions', () => {
  it('loads nothing until requested', () => {
    const { result } = renderHook(() => useCityOptions(), { wrapper });
    expect(result.current.options).toBeUndefined();
    expect(read).not.toHaveBeenCalledWith(expect.anything(), 'crd-cities', expect.anything());
  });

  it('on request, returns localized names with English fallback and the country code', async () => {
    const { result } = renderHook(() => useCityOptions(), { wrapper });
    act(() => result.current.onRequest());
    await waitFor(() => expect(result.current.options).toBeDefined());
    expect(result.current.options).toEqual([
      { id: 'NL.the_hague', name: 'La Haya', countryCode: 'NL', countryName: 'Netherlands' },
      { id: 'GB.london', name: 'London', countryCode: 'GB', countryName: 'United Kingdom' },
    ]);
  });
});
