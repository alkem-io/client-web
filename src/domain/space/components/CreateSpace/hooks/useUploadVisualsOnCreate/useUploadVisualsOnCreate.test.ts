import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const notify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

const uploadVisual = vi.fn();
const useUploadVisualMutationMock = vi.fn((_options?: { context?: unknown }) => [uploadVisual]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadVisualMutation: (options?: { context?: unknown }) => useUploadVisualMutationMock(options),
}));

import useUploadVisualsOnCreate from './useUploadVisualsOnCreate';

describe('useUploadVisualsOnCreate', () => {
  it("leaves a failed upload to the global error handler, so the server's reason is the one message", async () => {
    uploadVisual.mockRejectedValueOnce(
      new ApolloError({ graphQLErrors: [{ message: 'File too large', extensions: {} } as never] })
    );
    const { result } = renderHook(() => useUploadVisualsOnCreate());

    await result.current.uploadVisuals(
      { avatar: { id: 'visual-1' } },
      { avatar: { file: new File([''], 'a.png'), altText: '' } as never }
    );

    expect(useUploadVisualMutationMock).toHaveBeenCalledWith(undefined);
    expect(uploadVisual).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();
  });
});
