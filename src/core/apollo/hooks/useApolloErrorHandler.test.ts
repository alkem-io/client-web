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

    it('shows an operation or field the server does not serve yet as not available yet', () => {
      // the server's schema validation, answered with HTTP 422: a bare VALIDATION located in the document, on no path
      const refusal = { message: 'invalid', locations: [{ line: 1, column: 12 }], extensions: { code: 'VALIDATION' } };
      useApolloErrorHandler()(apolloError(serverResponse({ errors: [refusal] })));

      expect(notify).toHaveBeenCalledWith('apollo.errors.userMessages.operations.notAvailableYet', 'error', undefined);
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

describe('native server codes in the legacy wording', () => {
  // An executed field's refusal carries its path; the selection admission refuses before execution, on no path.
  const graphQLError = (code: string, message: string, path: string[] | null = ['node']) =>
    ({
      networkError: null,
      graphQLErrors: [{ message, ...(path ? { path } : {}), extensions: { code } }],
      clientErrors: [],
    }) as never;

  beforeEach(() => notify.mockReset());

  it.each([
    ['FORBIDDEN', 'forbidden', 'apollo.errors.userMessages.authorization.forbiddenPolicy'],
    ['NOT_FOUND', 'not found', 'apollo.errors.userMessages.notFound.entity'],
    ['ENTITLEMENT', 'entitlement unavailable', 'apollo.errors.userMessages.operations.licenseEntitlementNotAvailable'],
    ['UNAVAILABLE', 'unavailable', 'apollo.errors.userMessages.operations.notEnabled'],
    ['CONFLICT', 'conflict', 'apollo.errors.userMessages.operations.operationNotAllowed'],
    ['FORBIDDEN_OPERATION', 'operation not allowed', 'apollo.errors.userMessages.operations.operationNotAllowed'],
    ['TEMPLATE_NOT_READY', 'TEMPLATE_NOT_READY: invalid', 'apollo.errors.userMessages.validation.entityNotInitialized'],
    ['DEFAULT_UNAVAILABLE', 'default unavailable', 'apollo.errors.userMessages.validation.entityNotInitialized'],
    ['VISIT_BUDGET_EXHAUSTED', 'subtree visit budget exhausted', 'apollo.errors.UNSPECIFIED'],
    ['UNSUPPORTED_NODE_TYPE', 'unsupported node type', 'apollo.errors.userMessages.validation.notSupported'],
    ['INTERNAL', 'internal error', 'apollo.errors.UNSPECIFIED'],
    ['VALIDATION', 'invalid', 'apollo.errors.userMessages.validation.inputValidation'],
  ])('shows %s once, in its legacy wording, without the bare server text', (code, message, key) => {
    useApolloErrorHandler()(graphQLError(code, message));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(key, 'error', undefined);
  });

  it('shows the selection admission refusal (UNAVAILABLE on no path) as not available yet', () => {
    useApolloErrorHandler()(graphQLError('UNAVAILABLE', 'unavailable', null));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('apollo.errors.userMessages.operations.notAvailableYet', 'error', undefined);
  });

  it('shows a VALIDATION field message as legacy showed a BAD_USER_INPUT message', () => {
    useApolloErrorHandler()(graphQLError('VALIDATION', 'blueprint.nodes/profile/tagline: at most 128 characters'));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('apollo.errors.userMessages.validation.badUserInput', 'error', undefined);
  });
});
