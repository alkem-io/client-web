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
  it("leaves a failed create to the global error handler, so the server's reason is the one message", () => {
    renderHook(() => useCreateInnovationPack({ accountId: 'acc-1' }));
    expect(hookOptions.current).not.toHaveProperty('context');
  });
});
