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
});

afterEach(() => {
  vi.unstubAllEnvs();
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
