import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: () => false },
  }),
}));

import { useErrorHandlerLink } from './useErrorHandlerLink';

const QUERY = gql`
  query SomeQuery {
    me {
      id
    }
  }
`;

const SUBSCRIPTION = gql`
  subscription SomeSubscription {
    roomEvents {
      roomID
    }
  }
`;

/** A socket drop reaches the error link as a plain Error: no status code, no server payload. */
const SOCKET_CLOSED = new Error('Socket closed with event 1006 ');

/** Terminating link that fails every operation the way a lost transport does. */
const failingLink = new ApolloLink(
  () =>
    new Observable(observer => {
      observer.error(SOCKET_CLOSED);
    })
);

/** Pushes one operation through the error link and resolves once it has settled. */
const runOperation = (link: ApolloLink, query: typeof QUERY) =>
  new Promise<void>(resolve => {
    execute(ApolloLink.from([link, failingLink]), { query }).subscribe({
      error: () => resolve(),
      complete: () => resolve(),
    });
  });

describe('useErrorHandlerLink', () => {
  beforeEach(() => {
    notify.mockClear();
    Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true });
  });

  it('does not report a subscription losing its transport', async () => {
    const { result } = renderHook(() => useErrorHandlerLink());

    await runOperation(result.current, SUBSCRIPTION);

    expect(notify).not.toHaveBeenCalled();
  });

  it('stays silent when several live subscriptions drop together', async () => {
    const { result } = renderHook(() => useErrorHandlerLink());

    await Promise.all([
      runOperation(result.current, SUBSCRIPTION),
      runOperation(result.current, SUBSCRIPTION),
      runOperation(result.current, SUBSCRIPTION),
    ]);

    expect(notify).not.toHaveBeenCalled();
  });

  it('still reports the same failure for a query — the user is waiting on that one', async () => {
    const { result } = renderHook(() => useErrorHandlerLink());

    await runOperation(result.current, QUERY);

    expect(notify).toHaveBeenCalledWith('apollo.errors.network.generic', 'error');
  });
});
