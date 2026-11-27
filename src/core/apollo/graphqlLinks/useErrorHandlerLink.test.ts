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

const handled = vi.fn();

vi.mock('../hooks/useApolloErrorHandler', async importOriginal => {
  const actual = await importOriginal<typeof import('../hooks/useApolloErrorHandler')>();
  return {
    ...actual,
    useApolloErrorHandler: () => {
      const handleError = actual.useApolloErrorHandler();
      return (error: Parameters<typeof handleError>[0]) => {
        handled(error);
        handleError(error);
      };
    },
  };
});

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
    handled.mockClear();
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

    it('hands every concurrent refusal to the one helper', async () => {
      const { result } = renderHook(() => useErrorHandlerLink());

      await Promise.all([runRefused(result.current), runRefused(result.current)]);

      expect(routeToSecondFactor).toHaveBeenCalledTimes(2);
      expect(notify).not.toHaveBeenCalled();
    });
  });

  describe('errors in a GraphQL response', () => {
    const MUTATION = gql`
      mutation SomeMutation {
        deletePost(deleteData: { ID: "x" }) {
          id
        }
      }
    `;

    type ResponseError = { message: string; extensions: { code: string } };

    const error = (code: string, message = `${code} message`): ResponseError => ({ message, extensions: { code } });

    /** Terminating link that answers every operation with the given GraphQL errors. */
    const answeringWith = (errors: ResponseError[]) =>
      new ApolloLink(
        () =>
          new Observable(observer => {
            observer.next({ errors } as never);
            observer.complete();
          })
      );

    const run = (query: typeof QUERY, errors: ResponseError[], context: Record<string, unknown> = {}) => {
      const { result } = renderHook(() => useErrorHandlerLink());
      return new Promise<void>(resolve => {
        execute(ApolloLink.from([result.current, answeringWith(errors)]), { query, context }).subscribe({
          error: () => resolve(),
          complete: () => resolve(),
        });
      });
    };

    const handledErrors = () => handled.mock.calls.flatMap(([apolloError]) => apolloError.graphQLErrors);

    it.each([
      'FORBIDDEN_POLICY',
      'FORBIDDEN',
    ])('passes a mutation the one %s error it was answered with', async code => {
      const refusal = error(code);

      await run(MUTATION, [refusal]);

      expect(handledErrors()).toEqual([refusal]);
    });

    it.each([
      ['two FORBIDDEN_POLICY errors', ['FORBIDDEN_POLICY', 'FORBIDDEN_POLICY']],
      ['a FORBIDDEN and a FORBIDDEN_POLICY error', ['FORBIDDEN', 'FORBIDDEN_POLICY']],
    ])('passes a mutation answered with %s only the first', async (_, codes) => {
      const errors = codes.map((code, index) => error(code, `refusal ${index}`));

      await run(MUTATION, errors);

      expect(handledErrors()).toEqual([errors[0]]);
    });

    it('passes a mutation a refusal together with an error of another code', async () => {
      const errors = [error('FORBIDDEN_POLICY'), error('BAD_USER_INPUT')];

      await run(MUTATION, errors);

      expect(handledErrors()).toEqual(errors);
    });

    it.each([
      ['query', 'FORBIDDEN_POLICY'],
      ['query', 'FORBIDDEN'],
      ['subscription', 'FORBIDDEN_POLICY'],
      ['subscription', 'FORBIDDEN'],
    ] as const)('passes a %s none of its %s errors', async (operation, code) => {
      await run(operation === 'query' ? QUERY : SUBSCRIPTION, [error(code)]);

      expect(handledErrors()).toEqual([]);
      expect(notify).not.toHaveBeenCalled();
    });

    it('passes nothing for a mutation that opted out of the global handler', async () => {
      await run(MUTATION, [error('FORBIDDEN_POLICY')], { skipGlobalErrorHandler: true });

      expect(handled).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    });

    it.each([
      ['query', QUERY],
      ['mutation', MUTATION],
      ['subscription', SUBSCRIPTION],
    ])('drops URL_RESOLVER_ERROR for a %s', async (_operation, query) => {
      await run(query, [error('URL_RESOLVER_ERROR')]);

      expect(handledErrors()).toEqual([]);
    });

    it('routes a missing second factor before the opt-out', async () => {
      await run(MUTATION, [error('SECOND_FACTOR_REQUIRED')], { skipGlobalErrorHandler: true });

      expect(routeToSecondFactor).toHaveBeenCalledTimes(1);
      expect(handled).not.toHaveBeenCalled();
    });

    it('still forwards ENTITY_NOT_FOUND on a query', async () => {
      const notFound = error('ENTITY_NOT_FOUND');

      await run(QUERY, [notFound]);

      expect(handledErrors()).toEqual([notFound]);
    });
  });
});
