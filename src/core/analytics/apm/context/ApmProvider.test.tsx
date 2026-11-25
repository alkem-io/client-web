import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { ALKEMIO_COOKIE_NAME, AlkemioCookieTypes } from '@/main/cookies/useAlkemioCookies';
import { ApmProvider } from './ApmProvider';
import { useApm } from './useApm';

let mockCookies: Record<string, unknown> = {};

vi.mock('react-cookie', () => ({
  useCookies: () => [mockCookies, vi.fn(), vi.fn()],
}));

const agent = { setUserContext: vi.fn(), setCustomContext: vi.fn(), addLabels: vi.fn() };
const initApm = vi.fn(() => agent);
const reload = vi.fn();

vi.mock('@elastic/apm-rum', () => ({
  init: () => initApm(),
}));

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ apm: { rumEnabled: true, endpoint: 'http://apm.test' }, locations: { environment: 'test' } }),
}));

const ACCEPTED = [AlkemioCookieTypes.technical, AlkemioCookieTypes.analysis];

const AgentProbe = () => <span>{useApm() ? 'started' : 'not started'}</span>;

const tree = (path = '/home') => (
  <MemoryRouter initialEntries={[path]}>
    <ApmProvider>
      <AgentProbe />
    </ApmProvider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.stubEnv('MODE', 'production');
  mockCookies = {};
  initApm.mockClear();
  reload.mockClear();
  vi.stubGlobal('location', { ...window.location, reload });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('ApmProvider consent gate', () => {
  it.each([
    ['no consent cookie', undefined],
    ['only necessary', [AlkemioCookieTypes.technical]],
    ['a malformed consent cookie', true],
  ])('does not start the agent with %s', (_label, consent) => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: consent };

    render(tree());

    expect(initApm).not.toHaveBeenCalled();
    expect(screen.getByText('not started')).toBeTruthy();
  });

  it('starts the agent when the visitor accepts mid-session', () => {
    const { rerender } = render(tree());
    expect(initApm).not.toHaveBeenCalled();

    mockCookies = { [ALKEMIO_COOKIE_NAME]: ACCEPTED };
    rerender(tree());

    expect(initApm).toHaveBeenCalled();
    expect(screen.getByText('started')).toBeTruthy();
  });

  it('does not start the agent on auth pages, even with consent', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: ACCEPTED };

    render(tree(AUTH_SIGN_UP_PATH));

    expect(initApm).not.toHaveBeenCalled();
  });
});

describe('ApmProvider when consent goes away', () => {
  it('reloads the page when consent is withdrawn while the agent runs, wherever the cookie changed', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: ACCEPTED };
    const { rerender } = render(tree());
    expect(screen.getByText('started')).toBeTruthy();
    expect(reload).not.toHaveBeenCalled();

    // The cookie changed: in this tab, in another tab, or on the welcome site.
    mockCookies = { [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical] };
    rerender(tree());

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when the agent never started', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical] };
    const { rerender } = render(tree());

    mockCookies = {};
    rerender(tree());

    expect(reload).not.toHaveBeenCalled();
  });
});
