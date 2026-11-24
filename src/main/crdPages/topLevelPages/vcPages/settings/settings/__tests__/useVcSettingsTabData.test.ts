import { ApolloError } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AiPersonaEngine } from '@/core/apollo/generated/graphql-schema';

const { mutationOptions, recordMutation, updateAiPersona } = vi.hoisted(() => {
  const mutationOptions: Record<string, unknown> = {};
  const updateAiPersona = vi.fn(() => Promise.resolve({}));
  const recordMutation = (name: string, run?: () => Promise<unknown>) => (options: unknown) => {
    mutationOptions[name] = options;
    return [run ?? (() => Promise.resolve({})), { loading: false }];
  };
  return { mutationOptions, recordMutation, updateAiPersona };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { exists: (key: string) => key.startsWith('apollo.errors.userMessages.') },
  }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorQuery: () => ({ data: undefined, loading: false, refetch: () => Promise.resolve({}) }),
  useAiPersonaQuery: () => ({
    data: { virtualContributor: { aiPersona: { id: 'ap-1', engine: AiPersonaEngine.GenericOpenai, prompt: ['old'] } } },
    loading: false,
  }),
  useVirtualContributorKnowledgeBaseLastUpdatedQuery: () => ({ data: undefined, refetch: () => Promise.resolve({}) }),
  useUpdateVirtualContributorMutation: recordMutation('updateVc'),
  useUpdateVirtualContributorSettingsMutation: recordMutation('updateVcSettings'),
  useUpdateAiPersonaMutation: recordMutation('updateAiPersona', updateAiPersona),
  useRefreshBodyOfKnowledgeMutation: recordMutation('refreshBok'),
  useUpdateVirtualContributorPlatformSettingsMutation: recordMutation('updatePlatformSettings'),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformPrivilegeWrapper: undefined }),
}));

import { useVcSettingsTabData } from '../useVcSettingsTabData';

describe('useVcSettingsTabData', () => {
  it('leaves a failed immediate commit to the global error handler; a section save shows its own failure', () => {
    renderHook(() => useVcSettingsTabData({ vcId: 'vc-1' }));
    expect(mutationOptions).toEqual({
      updateVc: undefined,
      updateVcSettings: undefined,
      updateAiPersona: { context: { skipGlobalErrorHandler: true } },
      refreshBok: undefined,
      updatePlatformSettings: undefined,
    });
  });

  it("shows the server's reason in the section when a prompt save is refused", async () => {
    updateAiPersona.mockRejectedValueOnce(
      new ApolloError({
        graphQLErrors: [
          {
            message: 'Prompt is too long',
            extensions: { code: 'OPERATION_NOT_ALLOWED', userMessage: 'userMessages.operations.operationNotAllowed' },
          } as never,
        ],
      })
    );
    const { result } = renderHook(() => useVcSettingsTabData({ vcId: 'vc-1' }));

    act(() => result.current.prompt?.onChange('new'));
    await act(async () => {
      await result.current.prompt?.onSave();
    });

    expect(result.current.prompt?.status).toEqual({
      kind: 'error',
      message: 'apollo.errors.userMessages.operations.operationNotAllowed Prompt is too long',
    });
  });
});
