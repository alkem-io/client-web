import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { hookOptions } = vi.hoisted(() => ({ hookOptions: { current: undefined as unknown } }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateInnovationPackMutation: (options: unknown) => {
    hookOptions.current = options;
    return [vi.fn(), { loading: false }];
  },
  useAdminInnovationPackLazyQuery: () => [vi.fn()],
}));

import { useCreateInnovationPack } from '../useCreateInnovationPack';

describe('useCreateInnovationPack', () => {
  it('its dialog toasts a failed create, so the mutation opts out of the global error handler', () => {
    renderHook(() => useCreateInnovationPack({ accountId: 'acc-1' }));
    expect(hookOptions.current).toMatchObject({ context: { skipGlobalErrorHandler: true } });
  });
});
