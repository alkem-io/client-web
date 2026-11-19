import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ integration: {} }) }));
vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  useStorageConfigContext: () => ({ storageBucketId: 'sb-1' }),
}));

const useUploadFileMutationMock = vi.fn((_options?: { context?: unknown }) => [vi.fn()]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: (options?: { context?: unknown }) => useUploadFileMutationMock(options),
}));

import { useMarkdownEditorIntegration } from './useMarkdownEditorIntegration';

describe('useMarkdownEditorIntegration', () => {
  it('uploads images without the global error handler, since the editor reports a failed upload through onError', () => {
    renderHook(() => useMarkdownEditorIntegration());

    expect(useUploadFileMutationMock).toHaveBeenCalledWith({ context: { skipGlobalErrorHandler: true } });
  });
});
