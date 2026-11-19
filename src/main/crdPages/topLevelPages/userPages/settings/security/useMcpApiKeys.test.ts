import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mutationHooks = vi.hoisted(() => ({
  mint: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
  revoke: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useMyMcpApiKeysQuery: () => ({ data: undefined, loading: false, error: undefined, refetch: vi.fn() }),
  useMintMcpApiKeyMutation: mutationHooks.mint,
  useRevokeMcpApiKeyMutation: mutationHooks.revoke,
}));

import useMcpApiKeys from './useMcpApiKeys';

describe('useMcpApiKeys', () => {
  it('reports its own mint and revoke failures, so both opt out of the global error handler', () => {
    renderHook(() => useMcpApiKeys());

    const optedOut = expect.objectContaining({ context: { skipGlobalErrorHandler: true } });
    expect(mutationHooks.mint).toHaveBeenCalledWith(optedOut);
    expect(mutationHooks.revoke).toHaveBeenCalledWith(optedOut);
  });
});
