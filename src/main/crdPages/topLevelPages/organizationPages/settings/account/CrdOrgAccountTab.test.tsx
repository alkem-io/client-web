import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const deleteMutationHooks = vi.hoisted(() => ({
  space: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
  virtualContributor: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
  innovationPack: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
  innovationHub: vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAccountInformationQuery: () => ({ data: undefined, loading: false }),
  useOrganizationAccountQuery: () => ({ data: undefined, loading: false }),
  useDeleteSpaceMutation: deleteMutationHooks.space,
  useDeleteVirtualContributorOnAccountMutation: deleteMutationHooks.virtualContributor,
  useDeleteInnovationPackMutation: deleteMutationHooks.innovationPack,
  useDeleteInnovationHubMutation: deleteMutationHooks.innovationHub,
}));

vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({ organizationId: 'org-1' }),
}));
vi.mock('@/crd/components/contributor/settings/ContributorAccountView', () => ({ ContributorAccountView: () => null }));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('@/main/crdPages/innovationHub/CrdCreateInnovationHubDialog', () => ({
  CrdCreateInnovationHubDialog: () => null,
}));
vi.mock('@/main/crdPages/innovationPack/CrdCreateInnovationPackDialog', () => ({
  CrdCreateInnovationPackDialog: () => null,
}));
vi.mock('@/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog', () => ({ CrdCreateSpaceDialog: () => null }));
vi.mock('@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog', () => ({
  CrdVCCreationWizardDialog: () => null,
}));
vi.mock('./orgAccountMapper', () => ({ mapOrgAccountToViewProps: () => ({}) }));

import CrdOrgAccountTab from './CrdOrgAccountTab';

describe('CrdOrgAccountTab', () => {
  it('reports its own delete outcomes, so every delete opts out of the global error handler', () => {
    render(<CrdOrgAccountTab />);

    for (const useDeleteMutation of Object.values(deleteMutationHooks)) {
      expect(useDeleteMutation).toHaveBeenCalledWith(
        expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
      );
    }
  });
});
