import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const updateGuestAccess = vi.fn();
const useUpdateWhiteboardGuestAccessMutationMock = vi.fn((_options?: { context?: unknown }) => [
  updateGuestAccess,
  { loading: false },
]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateWhiteboardGuestAccessMutation: (options?: { context?: unknown }) =>
    useUpdateWhiteboardGuestAccessMutationMock(options),
}));
vi.mock('@/core/analytics/events/collaborationGuestAccess', () => ({
  trackGuestAccessToggleAttempt: vi.fn(),
  trackGuestAccessToggleFailure: vi.fn(),
  trackGuestAccessToggleSuccess: vi.fn(),
}));

import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useWhiteboardGuestAccess from './useWhiteboardGuestAccess';

describe('useWhiteboardGuestAccess', () => {
  it("leaves a failed toggle to the global error handler, which shows the server's reason, and adds no inline error", async () => {
    updateGuestAccess.mockRejectedValueOnce(new Error('refused'));
    const { result } = renderHook(() =>
      useWhiteboardGuestAccess({
        whiteboard: { id: 'wb-1', authorization: { myPrivileges: [AuthorizationPrivilege.PublicShare] } },
      })
    );

    await act(async () => {
      await result.current.onToggle(true).catch(() => undefined);
    });

    expect(useUpdateWhiteboardGuestAccessMutationMock).toHaveBeenCalledWith(undefined);
    expect(updateGuestAccess).toHaveBeenCalled();
    expect(result.current.hasError).toBe(false);
  });
});
