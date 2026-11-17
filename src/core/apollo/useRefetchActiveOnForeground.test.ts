/**
 * @vitest-environment jsdom
 */
import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRefetchActiveOnForeground } from './useRefetchActiveOnForeground';

const harness = vi.hoisted(() => ({ isAuthenticated: true }));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ isAuthenticated: harness.isAuthenticated }),
}));

let visibility: DocumentVisibilityState = 'visible';

const fireVisibilityChange = (state: DocumentVisibilityState) => {
  visibility = state;
  act(() => void document.dispatchEvent(new Event('visibilitychange')));
};

const setup = () => {
  const client = new ApolloClient({ link: ApolloLink.empty(), cache: new InMemoryCache() });
  const refetchQueries = vi.spyOn(client, 'refetchQueries');
  const wrapper = ({ children }: { children: ReactNode }) => createElement(ApolloProvider, { client, children });
  renderHook(() => useRefetchActiveOnForeground(), { wrapper });
  return { refetchQueries };
};

beforeEach(() => {
  harness.isAuthenticated = true;
  visibility = 'hidden';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
  vi.useFakeTimers({ toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useRefetchActiveOnForeground', () => {
  it('refetches active queries when the page becomes visible', () => {
    const { refetchQueries } = setup();

    fireVisibilityChange('visible');

    expect(refetchQueries).toHaveBeenCalledTimes(1);
    expect(refetchQueries).toHaveBeenCalledWith({ include: 'active' });
  });

  it('refetches at most once per 30 s', () => {
    const { refetchQueries } = setup();

    fireVisibilityChange('visible');
    fireVisibilityChange('hidden');
    vi.advanceTimersByTime(29_000);
    fireVisibilityChange('visible');
    expect(refetchQueries).toHaveBeenCalledTimes(1);

    fireVisibilityChange('hidden');
    vi.advanceTimersByTime(1_000);
    fireVisibilityChange('visible');
    expect(refetchQueries).toHaveBeenCalledTimes(2);
  });

  it('does not refetch when the page is hidden', () => {
    const { refetchQueries } = setup();

    fireVisibilityChange('hidden');

    expect(refetchQueries).not.toHaveBeenCalled();
  });

  it('does not refetch for anonymous users', () => {
    harness.isAuthenticated = false;
    const { refetchQueries } = setup();

    fireVisibilityChange('visible');

    expect(refetchQueries).not.toHaveBeenCalled();
  });
});
