import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notify,
}));

// Only the keys the real crd-common namespace declares resolve; everything else falls back.
const EXISTING_KEYS = new Set([
  'apollo.errors.network.session_store_unavailable',
  'apollo.errors.generic',
  'apollo.errors.userMessages.authorization.forbiddenPolicy',
  'apollo.errors.userMessages.operations.operationNotAllowed',
]);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: (key: string) => EXISTING_KEYS.has(key) },
  }),
}));

import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { useErrorHandlerLink } from '../graphqlLinks/useErrorHandlerLink';
import { useApolloErrorHandler, useServerErrorMessage } from './useApolloErrorHandler';

/**
 * Shaped like the `ApolloError` the global error link builds. Only `networkError` and
 * `graphQLErrors` are read, so a literal is enough and avoids depending on Apollo internals.
 */
const apolloError = (networkError: unknown) =>
  ({
    networkError,
    graphQLErrors: [],
    clientErrors: [],
  }) as never;

/** A fetch that never reached the server: offline, DNS failure, a dropped socket. */
const connectivityFailure = (message: string) => new Error(message);

/** What `apollo-upload-client` throws once the server answered with a non-2xx JSON body. */
const serverResponse = (result: Record<string, unknown>) =>
  Object.assign(new Error('Response not successful'), { statusCode: 503, result });

const setBrowserOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, 'onLine', { value, configurable: true });
};

describe('useApolloErrorHandler', () => {
  beforeEach(() => {
    notify.mockClear();
    setBrowserOnline(true);
  });

  afterEach(() => {
    setBrowserOnline(true);
  });

  describe('while the browser reports itself offline', () => {
    beforeEach(() => {
      setBrowserOnline(false);
    });

    it('does not toast a failed fetch — the online-status banner already shows it', () => {
      useApolloErrorHandler()(apolloError(connectivityFailure('Failed to fetch')));

      expect(notify).not.toHaveBeenCalled();
    });

    it('does not toast a dropped subscription socket', () => {
      useApolloErrorHandler()(apolloError(connectivityFailure('Socket closed with event 1006')));

      expect(notify).not.toHaveBeenCalled();
    });

    it('stays silent however many operations fail at once', () => {
      const handleError = useApolloErrorHandler();

      for (let i = 0; i < 5; i++) {
        handleError(apolloError(connectivityFailure('Failed to fetch')));
      }

      expect(notify).not.toHaveBeenCalled();
    });

    it('still surfaces an error the server itself reported', () => {
      useApolloErrorHandler()(apolloError(serverResponse({ error: 'session_store_unavailable' })));

      expect(notify).toHaveBeenCalledWith('apollo.errors.network.session_store_unavailable', 'error');
    });
  });

  describe('while the browser believes it is online', () => {
    it('surfaces a connection failure — the server may be unreachable with no other signal', () => {
      useApolloErrorHandler()(apolloError(connectivityFailure('Failed to fetch')));

      expect(notify).toHaveBeenCalledWith('apollo.errors.network.generic', 'error');
    });

    it('surfaces a known server-reported network error with its own message', () => {
      useApolloErrorHandler()(apolloError(serverResponse({ error: 'session_store_unavailable' })));

      expect(notify).toHaveBeenCalledWith('apollo.errors.network.session_store_unavailable', 'error');
    });

    it('falls back to the generic message for an unrecognised server-reported error', () => {
      useApolloErrorHandler()(apolloError(serverResponse({ error: 'something_unmapped' })));

      expect(notify).toHaveBeenCalledWith('apollo.errors.network.generic', 'error');
    });

    it('surfaces GraphQL errors carried in a network error payload', () => {
      useApolloErrorHandler()(apolloError(serverResponse({ errors: [{ message: 'Boom', extensions: {} }] })));

      expect(notify).toHaveBeenCalledWith('apollo.errors.generic', 'error', undefined);
    });
  });

  it('does nothing when there is no network error at all', () => {
    useApolloErrorHandler()(apolloError(null));

    expect(notify).not.toHaveBeenCalled();
  });

  describe('a not-available error', () => {
    const ID = '6df9be66-1c2d-4e5f-8a9b-0c1d2e3f4a5b';

    const graphQLError = (message: string, extensions: Record<string, unknown>) => ({ message, extensions });

    const withGraphQLErrors = (graphQLErrors: unknown[]) =>
      ({ networkError: null, graphQLErrors, clientErrors: [] }) as never;

    const neutral = graphQLError(`Space ${ID} of the account ${ID} could not be updated for the caller ${ID}.`, {
      code: 'FORBIDDEN_POLICY',
      userMessage: 'userMessages.authorization.forbiddenPolicy',
      errorId: 'ref-1',
    });

    // Shaped as a server without the neutral outcome sends them: a composed message, no userMessage.
    const earlierServerRefusals = [
      [
        'FORBIDDEN',
        graphQLError('User is not allowed to perform this action.', { code: 'FORBIDDEN', errorId: 'ref-2' }),
      ],
      [
        'FORBIDDEN_POLICY',
        graphQLError(
          `Authorization: unable to grant 'grant' privilege: assign role user: ${ID} on authorization ${ID} of type 'RoleSet'`,
          { code: 'FORBIDDEN_POLICY', errorId: 'ref-3' }
        ),
      ],
    ] as const;

    it('shows the one translated sentence and not the server message', () => {
      useApolloErrorHandler()(withGraphQLErrors([neutral]));

      expect(notify).toHaveBeenCalledTimes(1);
      expect(notify).toHaveBeenCalledWith(
        'apollo.errors.userMessages.authorization.forbiddenPolicy',
        'error',
        undefined
      );
    });

    it.each(earlierServerRefusals)('shows one message for a %s refusal from an earlier server', (_, refusal) => {
      useApolloErrorHandler()(withGraphQLErrors([refusal]));

      expect(notify).toHaveBeenCalledTimes(1);
    });

    describe('answering a mutation, through the global error link', () => {
      const MUTATION = gql`
        mutation SomeMutation {
          deletePost(deleteData: { ID: "x" }) {
            id
          }
        }
      `;

      const runMutation = (errors: unknown[]) => {
        const { result } = renderHook(() => useErrorHandlerLink());
        const answering = new ApolloLink(
          () =>
            new Observable(observer => {
              observer.next({ errors } as never);
              observer.complete();
            })
        );
        return new Promise<void>(resolve => {
          execute(ApolloLink.from([result.current, answering]), { query: MUTATION }).subscribe({
            error: () => resolve(),
            complete: () => resolve(),
          });
        });
      };

      it('shows one message for the neutral outcome', async () => {
        await runMutation([neutral, neutral]);

        expect(notify).toHaveBeenCalledTimes(1);
      });

      it.each(
        earlierServerRefusals
      )('shows one message for a %s refusal from an earlier server', async (_, refusal) => {
        await runMutation([refusal]);

        expect(notify).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe('useServerErrorMessage', () => {
  const ID = '6df9be66-1c2d-4e5f-8a9b-0c1d2e3f4a5b';
  const FALLBACK = 'The change could not be saved. Please try again.';

  const withGraphQLErrors = (graphQLErrors: unknown[]) =>
    ({ networkError: null, graphQLErrors, clientErrors: [] }) as never;

  const notAvailable = {
    message: 'Not available',
    extensions: { code: 'FORBIDDEN_POLICY', userMessage: 'userMessages.authorization.forbiddenPolicy' },
  };
  const notAllowed = {
    message: `Unable to remove Space (${ID}), with level 0, as it contains 6 subspaces`,
    extensions: { code: 'OPERATION_NOT_ALLOWED', userMessage: 'userMessages.operations.operationNotAllowed' },
  };

  it('carries the server reason the global handler would have shown, without ids', () => {
    expect(useServerErrorMessage()(withGraphQLErrors([notAllowed]), FALLBACK)).toBe(
      'apollo.errors.userMessages.operations.operationNotAllowed Unable to remove Space, with level 0, as it contains 6 subspaces'
    );
  });

  it('shows the not-available sentence for a refusal that says nothing more', () => {
    expect(useServerErrorMessage()(withGraphQLErrors([notAvailable]), FALLBACK)).toBe(
      'apollo.errors.userMessages.authorization.forbiddenPolicy'
    );
  });

  it('prefers an error that says more than "not available" when a response carries both', () => {
    expect(useServerErrorMessage()(withGraphQLErrors([notAvailable, notAllowed]), FALLBACK)).toContain(
      'as it contains 6 subspaces'
    );
  });

  it('ignores a URL resolver error', () => {
    const urlResolver = { message: 'No space at this URL', extensions: { code: 'URL_RESOLVER_ERROR' } };
    expect(useServerErrorMessage()(withGraphQLErrors([urlResolver]), FALLBACK)).toBe(FALLBACK);
  });

  it('uses the fallback for a failure with no GraphQL error', () => {
    expect(useServerErrorMessage()(apolloError(new Error('Failed to fetch')), FALLBACK)).toBe(FALLBACK);
    expect(useServerErrorMessage()(new Error('Upload failed'), FALLBACK)).toBe(FALLBACK);
    expect(useServerErrorMessage()(undefined, FALLBACK)).toBe(FALLBACK);
  });
});
