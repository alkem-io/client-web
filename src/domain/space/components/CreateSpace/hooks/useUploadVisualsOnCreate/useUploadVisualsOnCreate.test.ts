import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));

const useUploadVisualMutationMock = vi.fn((_options?: { context?: unknown }) => [vi.fn()]);
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadVisualMutation: (options?: { context?: unknown }) => useUploadVisualMutationMock(options),
}));

import useUploadVisualsOnCreate from './useUploadVisualsOnCreate';

describe('useUploadVisualsOnCreate', () => {
  it('uploads without the global error handler, since a failed upload shows its own toast', () => {
    renderHook(() => useUploadVisualsOnCreate({ entityName: 'Space' }));

    expect(useUploadVisualMutationMock).toHaveBeenCalledWith({ context: { skipGlobalErrorHandler: true } });
  });
});
