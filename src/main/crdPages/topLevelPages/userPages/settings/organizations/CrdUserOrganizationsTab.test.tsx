import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const useRemoveRoleFromUserMutation = vi.hoisted(() => vi.fn((_options?: unknown) => [vi.fn(), { loading: false }]));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  refetchUserOrganizationIdsQuery: (variables: unknown) => ({ query: 'UserOrganizationIds', variables }),
  useRemoveRoleFromUserMutation,
  useUserOrganizationIdsQuery: () => ({ data: undefined, loading: false }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ platformPrivilegeWrapper: undefined }),
}));
vi.mock('@/crd/components/dialogs/ConfirmationDialog', () => ({ ConfirmationDialog: () => null }));
vi.mock('@/crd/components/user/settings/UserOrganizationsTabView', () => ({ UserOrganizationsTabView: () => null }));
vi.mock('@/main/crdPages/topLevelPages/organizationPages/form/CreateOrganizationDialog', () => ({
  default: () => null,
}));
vi.mock('../../useUserPageRouteContext', () => ({ default: () => ({ userId: 'user-1' }) }));
vi.mock('./useOrganizationEnrichment', () => ({ default: () => new Map() }));

import CrdUserOrganizationsTab from './CrdUserOrganizationsTab';

describe('CrdUserOrganizationsTab', () => {
  it("leaves a failed disassociate to the global error handler, so the server's reason is the one message", () => {
    render(<CrdUserOrganizationsTab />);

    expect(useRemoveRoleFromUserMutation).toHaveBeenCalled();
    expect(useRemoveRoleFromUserMutation.mock.calls[0][0]).toBeUndefined();
  });
});
