import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OWN_ERROR_HANDLING } from '@/core/apollo/graphqlLinks/ownErrorHandling';

const notify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({
    t: (key: string, options?: { entity?: string }) => (options?.entity ? `${key}(${options.entity})` : key),
  }),
}));

vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({
  useServerErrorMessage: () => (error: unknown, fallback: string) =>
    (error as ApolloError | undefined)?.graphQLErrors?.[0]?.message ?? fallback,
}));

const uploadVisual = vi.fn();
const useUploadVisualMutationMock = vi.fn((_options?: { context?: unknown }) => [uploadVisual]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadVisualMutation: (options?: { context?: unknown }) => useUploadVisualMutationMock(options),
}));

import useUploadVisualsOnCreate from './useUploadVisualsOnCreate';

const created = 'components.visual-upload.entityCreatedErrorUploading(Space)';
const upload = (hook: ReturnType<typeof useUploadVisualsOnCreate>) =>
  hook.uploadVisuals(
    { avatar: { id: 'visual-1' } },
    { avatar: { file: new File([''], 'a.png'), altText: '' } as never }
  );

describe('useUploadVisualsOnCreate', () => {
  afterEach(() => vi.clearAllMocks());

  it("a failed upload is one message: the entity was created, then the server's reason", async () => {
    uploadVisual.mockRejectedValueOnce(
      new ApolloError({ graphQLErrors: [{ message: 'File too large', extensions: {} } as never] })
    );
    const { result } = renderHook(() => useUploadVisualsOnCreate({ entityName: 'Space' }));

    await upload(result.current);

    expect(useUploadVisualMutationMock).toHaveBeenCalledWith({ context: OWN_ERROR_HANDLING });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(`${created} File too large`, 'error');
  });

  it('a failure without a server reason still says the entity was created', async () => {
    uploadVisual.mockRejectedValueOnce(new Error('Failed to fetch'));
    const { result } = renderHook(() => useUploadVisualsOnCreate({ entityName: 'Space' }));

    await upload(result.current);

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(created, 'error');
  });

  it('a successful upload shows nothing', async () => {
    uploadVisual.mockResolvedValueOnce({ data: {} });
    const { result } = renderHook(() => useUploadVisualsOnCreate({ entityName: 'Space' }));

    await upload(result.current);

    expect(uploadVisual).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();
  });
});
