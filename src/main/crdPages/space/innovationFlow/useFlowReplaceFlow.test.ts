import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const replaceOptions = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchInnovationFlowDetailsQuery: vi.fn(),
  useSpaceTemplatesManagerQuery: () => ({ data: undefined }),
  useUpdateCollaborationFromSpaceTemplateMutation: (options: unknown) => {
    replaceOptions(options);
    return [vi.fn()];
  },
}));
vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  useTemplatePicker: () => ({
    selectedTemplateId: null,
    clearSelection: vi.fn(),
    pickerProps: {},
    openPicker: vi.fn(),
  }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

import { useFlowReplaceFlow } from './useFlowReplaceFlow';

describe('useFlowReplaceFlow', () => {
  it('leaves a refused replace to its own replaceFlow error message', () => {
    renderHook(() =>
      useFlowReplaceFlow({ collaborationId: 'collab-1', levelZeroSpaceId: 'space-1', accountId: 'account-1' })
    );

    expect(replaceOptions.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });
});
