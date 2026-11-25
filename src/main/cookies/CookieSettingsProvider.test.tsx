import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieSettingsProvider, useCookieSettings } from './CookieSettingsProvider';

let mockAgent: object | undefined;
const notify = vi.fn();
const saveConsent = vi.fn(() => true);
const reload = vi.fn();

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
  reload.mockReset();
  window.sessionStorage.clear();
  vi.stubGlobal('location', { ...window.location, reload });
});

afterEach(() => {
  vi.unstubAllGlobals();
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

describe('CookieSettingsProvider reload on withdrawal', () => {
  it('reloads when consent is withdrawn while the RUM agent runs, and confirms after the reload', () => {
    mockAgent = {};
    const before = mount();

    act(() => {
      before.result.current.saveCookieSettings(false);
    });

    expect(reload).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();

    // The reloaded page mounts the provider afresh and shows the confirmation once.
    before.unmount();
    mount();
    expect(notify).toHaveBeenCalledExactlyOnceWith('cookieConsent.saved', 'success');
    mount();
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('does not reload a withdrawal when the agent never started (no consent before, or RUM off)', () => {
    const { result } = mount();

    act(() => {
      result.current.saveCookieSettings(false);
    });

    expect(reload).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledExactlyOnceWith('cookieConsent.saved', 'success');
  });

  it('never reloads on accepting', () => {
    mockAgent = {};
    const { result } = mount();

    act(() => {
      result.current.saveCookieSettings(true);
    });

    expect(reload).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledExactlyOnceWith('cookieConsent.saved', 'success');
  });
});
