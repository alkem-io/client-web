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
  it('shows its own message when creating the VC or adding it to a community fails, so those opt out of the global error handler', () => {
    renderHook(() => useVcCreationWizard({ onExit: vi.fn() }));
    expect(mutationOptions.createVirtualContributor).toEqual(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
    expect(mutationOptions.assignRole).toEqual({ context: { skipGlobalErrorHandler: true } });
  });
});
