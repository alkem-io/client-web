import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => notify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { AlkemioGraphqlErrorCode } from '@/main/constants/errors';
import { isExclusivelyAuthorizationError, usePermissionDeniedNotifier } from './usePermissionDeniedNotifier';

/** Shaped like an ApolloError rejection: only `graphQLErrors[].extensions.code` is read. */
const graphqlRejection = (code: string) => ({
  graphQLErrors: [{ message: 'nope', extensions: { code } }],
});

describe('usePermissionDeniedNotifier', () => {
  beforeEach(() => {
    notify.mockClear();
  });

  it('notifies on a rejection consisting exclusively of FORBIDDEN_POLICY', async () => {
    const guard = usePermissionDeniedNotifier();
    const run = () => Promise.reject(graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN_POLICY));

    await expect(guard(run)).rejects.toBeDefined();

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error');
  });

  it('notifies on a rejection consisting exclusively of FORBIDDEN', async () => {
    const guard = usePermissionDeniedNotifier();
    const run = () => Promise.reject(graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN));

    await expect(guard(run)).rejects.toBeDefined();

    expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error');
  });

  it('does not notify when FORBIDDEN is mixed with a non-authorization code', async () => {
    const guard = usePermissionDeniedNotifier();
    const run = () =>
      Promise.reject({
        graphQLErrors: [
          { message: 'nope', extensions: { code: AlkemioGraphqlErrorCode.FORBIDDEN } },
          { message: 'gone', extensions: { code: AlkemioGraphqlErrorCode.ENTITY_NOT_FOUND } },
        ],
      });

    await expect(guard(run)).rejects.toBeDefined();

    expect(notify).not.toHaveBeenCalled();
  });

  it('does not notify on a network error', async () => {
    const guard = usePermissionDeniedNotifier();
    const run = () => Promise.reject({ networkError: new Error('offline') });

    await expect(guard(run)).rejects.toBeDefined();

    expect(notify).not.toHaveBeenCalled();
  });

  it('does not notify when the run succeeds', async () => {
    const guard = usePermissionDeniedNotifier();
    const run = () => Promise.resolve('ok');

    await expect(guard(run)).resolves.toBe('ok');

    expect(notify).not.toHaveBeenCalled();
  });

  it('re-throws the original rejection', async () => {
    const guard = usePermissionDeniedNotifier();
    const rejection = graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN);
    const run = () => Promise.reject(rejection);

    await expect(guard(run)).rejects.toBe(rejection);
  });
});

describe('isExclusivelyAuthorizationError', () => {
  it('is true for a whole-response FORBIDDEN_POLICY rejection', () => {
    expect(isExclusivelyAuthorizationError(graphqlRejection(AlkemioGraphqlErrorCode.FORBIDDEN_POLICY))).toBe(true);
  });

  it('is false for a bare Error', () => {
    expect(isExclusivelyAuthorizationError(new Error('boom'))).toBe(false);
  });

  it('is false for an empty graphQLErrors list', () => {
    expect(isExclusivelyAuthorizationError({ graphQLErrors: [] })).toBe(false);
  });
});
