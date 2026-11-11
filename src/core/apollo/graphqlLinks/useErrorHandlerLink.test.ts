import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
const routeToSecondFactor = vi.fn();

vi.mock('@/core/auth/authentication/routeToSecondFactor', () => ({
  routeToSecondFactor: () => routeToSecondFactor(),
}));

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
    routeToSecondFactor.mockClear();
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

  describe('SECOND_FACTOR_REQUIRED', () => {
    /** Terminating link that answers every operation with the server's second-factor refusal. */
    const refusingLink = new ApolloLink(
      () =>
        new Observable(observer => {
          observer.next({
            errors: [
              {
                message: 'Two-step verification is required for your account.',
                extensions: { code: 'SECOND_FACTOR_REQUIRED', numericCode: 11119 },
              },
            ],
          } as never);
          observer.complete();
        })
    );

    const runRefused = (link: ApolloLink, context: Record<string, unknown> = {}) =>
      new Promise<void>(resolve => {
        execute(ApolloLink.from([link, refusingLink]), { query: QUERY, context }).subscribe({
          error: () => resolve(),
          complete: () => resolve(),
        });
      });

    it('routes to the second-factor page and shows no toast', async () => {
      const { result } = renderHook(() => useErrorHandlerLink());

      await runRefused(result.current);

      expect(routeToSecondFactor).toHaveBeenCalledTimes(1);
      expect(notify).not.toHaveBeenCalled();
    });

    it('routes even for an operation that opted out of the global handler', async () => {
      const { result } = renderHook(() => useErrorHandlerLink());

      await runRefused(result.current, { skipGlobalErrorHandler: true });

      expect(routeToSecondFactor).toHaveBeenCalledTimes(1);
      expect(notify).not.toHaveBeenCalled();
    });

    it('hands every concurrent refusal to the one helper, which navigates once', async () => {
      const { result } = renderHook(() => useErrorHandlerLink());

      await Promise.all([runRefused(result.current), runRefused(result.current)]);

      expect(routeToSecondFactor).toHaveBeenCalledTimes(2);
      expect(notify).not.toHaveBeenCalled();
    });
  });
});
