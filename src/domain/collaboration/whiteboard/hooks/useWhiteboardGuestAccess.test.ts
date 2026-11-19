import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useUpdateWhiteboardGuestAccessMutationMock = vi.fn((_options?: { context?: unknown }) => [
  vi.fn(),
  { loading: false },
]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateWhiteboardGuestAccessMutation: (options?: { context?: unknown }) =>
    useUpdateWhiteboardGuestAccessMutationMock(options),
}));
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({ useApolloErrorHandler: () => vi.fn() }));

import useWhiteboardGuestAccess from './useWhiteboardGuestAccess';

describe('useWhiteboardGuestAccess', () => {
  it('reports a failed toggle itself, so the global error handler stays out of it', () => {
    renderHook(() => useWhiteboardGuestAccess({ whiteboard: { id: 'wb-1' } }));

    expect(useUpdateWhiteboardGuestAccessMutationMock).toHaveBeenCalledWith({
      context: { skipGlobalErrorHandler: true },
    });
  });
});
