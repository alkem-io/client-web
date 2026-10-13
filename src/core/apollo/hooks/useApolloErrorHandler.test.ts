import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notify,
}));

// Only the keys the real crd-common namespace declares resolve; everything else falls back.
const EXISTING_KEYS = new Set(['apollo.errors.network.session_store_unavailable', 'apollo.errors.generic']);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: (key: string) => EXISTING_KEYS.has(key) },
  }),
}));

import { useApolloErrorHandler } from './useApolloErrorHandler';

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
});
