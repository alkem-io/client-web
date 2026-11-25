import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieSettingsProvider, useCookieSettings } from './CookieSettingsProvider';

let mockAgent: object | undefined;
const notify = vi.fn();
const saveConsent = vi.fn(() => true);

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/analytics/apm/context', () => ({ useApm: () => mockAgent }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ locations: undefined }) }));
vi.mock('@/crd/components/common/CookieSettingsSheet', () => ({ CookieSettingsSheet: () => null }));
vi.mock('./useAlkemioCookies', () => ({
  useAlkemioCookies: () => ({ consent: { decided: true, analysis: true }, saveConsent }),
}));

const mount = () => renderHook(() => useCookieSettings(), { wrapper: CookieSettingsProvider });

beforeEach(() => {
  mockAgent = undefined;
  notify.mockReset();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CookieSettingsProvider in a browser that blocks site data', () => {
  it('mounts without a confirmation when sessionStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(() => mount()).not.toThrow();
    expect(notify).not.toHaveBeenCalled();
  });
});

describe('CookieSettingsProvider confirmation', () => {
  it('carries the confirmation across the reload when consent is withdrawn while the RUM agent runs', () => {
    mockAgent = {};
    const before = mount();

    act(() => {
      before.result.current.saveCookieSettings(false);
    });

    // ApmProvider reloads the page; the toast would be lost with it, so it waits for the remount.
    expect(notify).not.toHaveBeenCalled();

    before.unmount();
    mount();
    expect(notify).toHaveBeenCalledExactlyOnceWith('cookieConsent.saved', 'success');
    mount();
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('still saves a withdrawal when the marker cannot be written', () => {
    mockAgent = {};
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const { result } = mount();

    let saved = false;
    expect(() =>
      act(() => {
        saved = result.current.saveCookieSettings(false);
      })
    ).not.toThrow();
    expect(saved).toBe(true);
  });

  it('confirms a withdrawal at once when the agent never started (no consent before, or RUM off)', () => {
    const { result } = mount();

    act(() => {
      result.current.saveCookieSettings(false);
    });

    expect(notify).toHaveBeenCalledExactlyOnceWith('cookieConsent.saved', 'success');
  });

  it('confirms an acceptance at once', () => {
    mockAgent = {};
    const { result } = mount();

    act(() => {
      result.current.saveCookieSettings(true);
    });

    expect(notify).toHaveBeenCalledExactlyOnceWith('cookieConsent.saved', 'success');
  });
});
