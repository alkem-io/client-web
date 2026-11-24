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

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchMyResourcesQuery: () => ({}),
  useNewVirtualContributorMySpacesQuery: () => ({ data: undefined, loading: false }),
  useAllSpaceSubspacesLazyQuery: () => [vi.fn()],
  useSubspaceCommunityAndRoleSetIdLazyQuery: () => [vi.fn()],
  useUploadVisualMutation: recordMutation('uploadVisual'),
  useCreateVirtualContributorOnAccountMutation: recordMutation('createVirtualContributor'),
  useRefreshBodyOfKnowledgeMutation: recordMutation('refreshBoK'),
  useCreateLinkOnCalloutMutation: recordMutation('createLinkOnCallout'),
  useAssignRoleToVirtualContributorMutation: recordMutation('assignRole'),
}));

import { useVcCreationWizard } from '../useVcCreationWizard';

describe('useVcCreationWizard', () => {
  it("leaves a failed VC create or community add to the global error handler, so the server's reason is the one message", () => {
    renderHook(() => useVcCreationWizard({ onExit: vi.fn() }));
    expect(mutationOptions.createVirtualContributor).not.toHaveProperty('context');
    expect(mutationOptions).toHaveProperty('assignRole', undefined);
  });
});
