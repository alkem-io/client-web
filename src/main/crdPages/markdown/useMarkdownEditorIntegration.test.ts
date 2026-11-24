import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { exists: () => false } }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ integration: {} }) }));
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  useStorageConfigContext: () => ({ storageBucketId: 'sb-1' }),
}));

const uploadFile = vi.fn();
const useUploadFileMutationMock = vi.fn((_options?: { context?: unknown }) => [uploadFile]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: (options?: { context?: unknown }) => useUploadFileMutationMock(options),
}));

import { useMarkdownEditorIntegration } from './useMarkdownEditorIntegration';

describe('useMarkdownEditorIntegration', () => {
  it('uploads images without the global error handler, since the editor reports a failed upload through onError', () => {
    renderHook(() => useMarkdownEditorIntegration());

    expect(useUploadFileMutationMock).toHaveBeenCalledWith({ context: { skipGlobalErrorHandler: true } });
  });

  it("throws the server's reason for a refused upload, so the editor's one message carries it", async () => {
    uploadFile.mockRejectedValueOnce(
      new ApolloError({ graphQLErrors: [{ message: 'File too large', extensions: { code: 'BAD_USER_INPUT' } }] })
    );
    const { result } = renderHook(() => useMarkdownEditorIntegration());

    await expect(result.current.onImageUpload(new File(['x'], 'a.png'))).rejects.toThrow('File too large');
  });
});
