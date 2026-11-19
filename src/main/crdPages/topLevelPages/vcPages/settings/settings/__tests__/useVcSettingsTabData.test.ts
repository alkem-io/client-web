import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { mutationOptions, recordMutation } = vi.hoisted(() => {
  const mutationOptions: Record<string, unknown> = {};
  const recordMutation = (name: string) => (options: unknown) => {
    mutationOptions[name] = options;
    return [() => Promise.resolve({}), { loading: false }];
  };
  return { mutationOptions, recordMutation };
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorQuery: () => ({ data: undefined, loading: false, refetch: () => Promise.resolve({}) }),
  useAiPersonaQuery: () => ({ data: undefined, loading: false }),
  useVirtualContributorKnowledgeBaseLastUpdatedQuery: () => ({ data: undefined, refetch: () => Promise.resolve({}) }),
  useUpdateVirtualContributorMutation: recordMutation('updateVc'),
  useUpdateVirtualContributorSettingsMutation: recordMutation('updateVcSettings'),
  useUpdateAiPersonaMutation: recordMutation('updateAiPersona'),
  useRefreshBodyOfKnowledgeMutation: recordMutation('refreshBok'),
  useUpdateVirtualContributorPlatformSettingsMutation: recordMutation('updatePlatformSettings'),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformPrivilegeWrapper: undefined }),
}));

import { useVcSettingsTabData } from '../useVcSettingsTabData';

describe('useVcSettingsTabData', () => {
  it('shows its own message for a failed change, so those mutations opt out of the global error handler', () => {
    renderHook(() => useVcSettingsTabData({ vcId: 'vc-1', onCommitError: vi.fn() }));
    const ownErrorHandling = { context: { skipGlobalErrorHandler: true } };
    expect(mutationOptions).toEqual({
      updateVc: ownErrorHandling,
      updateVcSettings: ownErrorHandling,
      updateAiPersona: ownErrorHandling,
      // A failed body-of-knowledge refresh shows no message of its own.
      refreshBok: undefined,
      updatePlatformSettings: ownErrorHandling,
    });
  });
});
