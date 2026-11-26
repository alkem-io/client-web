import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const notifyMock = vi.fn();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));
vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: ['https://video.example'] } }),
}));

import { useCreateDialogMarkdown } from './useCreateDialogMarkdown';

describe('useCreateDialogMarkdown', () => {
  it('rejects an inline image before the space exists with the existing upload-error text', async () => {
    const { result } = renderHook(() => useCreateDialogMarkdown());
    await expect(result.current.onImageUpload(new File(['x'], 'a.png', { type: 'image/png' }))).rejects.toThrow(
      'components.file-upload.file-upload-error'
    );
  });

  it('shows editor errors and keeps the configured iframe allow-list', () => {
    const { result } = renderHook(() => useCreateDialogMarkdown());
    result.current.onError('components.file-upload.file-upload-error');
    expect(notifyMock).toHaveBeenCalledWith('components.file-upload.file-upload-error', 'error');
    expect(result.current.iframeAllowedUrls).toEqual(['https://video.example']);
  });
});
