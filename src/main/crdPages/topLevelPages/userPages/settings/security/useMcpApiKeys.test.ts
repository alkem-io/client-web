import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mint = vi.hoisted(() => vi.fn());
const mutationHooks = vi.hoisted(() => ({
  mint: vi.fn((_options?: unknown) => [mint, { loading: false }]),
  revoke: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: (key: string) => key.startsWith('apollo.errors.userMessages.') },
  }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useMyMcpApiKeysQuery: () => ({ data: undefined, loading: false, error: undefined, refetch: vi.fn() }),
  useMintMcpApiKeyMutation: mutationHooks.mint,
  useRevokeMcpApiKeyMutation: mutationHooks.revoke,
}));

import useMcpApiKeys from './useMcpApiKeys';

describe('useMcpApiKeys', () => {
  it('shows a failed create in its dialog, so only the create opts out of the global error handler', () => {
    renderHook(() => useMcpApiKeys());

    expect(mutationHooks.mint).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
    expect(mutationHooks.revoke).toHaveBeenCalled();
    expect(mutationHooks.revoke.mock.calls[0][0]).toBeUndefined();
  });

  it("shows the server's reason for a refused create in the dialog", async () => {
    mint.mockRejectedValueOnce(
      new ApolloError({
        graphQLErrors: [
          {
            message: 'Too many keys',
            extensions: { code: 'OPERATION_NOT_ALLOWED', userMessage: 'userMessages.operations.operationNotAllowed' },
          } as never,
        ],
      })
    );
    const { result } = renderHook(() => useMcpApiKeys());

    await act(async () => {
      await result.current.createKey({ name: 'k', operations: [], expiresAt: undefined } as never);
    });

    expect(result.current.createError).toBe('apollo.errors.userMessages.operations.operationNotAllowed Too many keys');
  });
});
