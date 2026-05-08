import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAccountInformationQuery,
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
  useOrganizationAccountQuery,
} from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ContributorAccountView } from '@/crd/components/contributor/settings/ContributorAccountView';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { type AccountResourceKind, mapOrgAccountToViewProps, type OrgAccountMapperCallbacks } from './orgAccountMapper';

/**
 * Per research §3 (Decision #3): create flows navigate to existing MUI
 * admin routes — same URLs as the User-side `CrdUserAccountTab`.
 */
const CREATE_URLS = {
  space: '/admin/spaces/new',
  virtualContributor: '/admin/virtual-contributors/new',
  innovationPack: '/admin/innovation-packs/new',
  innovationHub: '/admin/innovation-hubs/new',
} as const;

type PendingDelete = { kind: AccountResourceKind; id: string; name: string };

/**
 * Integration page for the Org Account tab (US9). Mirrors
 * `CrdUserAccountTab` (US2) but reads from `useOrganizationAccountQuery`
 * → `account.id` → `useAccountInformationQuery`. The rest of the flow —
 * delete mutations, ConfirmationDialog, kebab actions, create
 * navigations — is identical to the User side.
 */
const CrdOrgAccountTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const navigate = useNavigate();
  const notify = useNotification();
  const { organizationId } = useOrganizationContext();
  const [, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const { data: orgData, loading: loadingOrg } = useOrganizationAccountQuery({
    variables: { organizationId: organizationId ?? '' },
    skip: !organizationId,
  });

  const accountId = orgData?.lookup.organization?.account?.id;
  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: { accountId: accountId ?? '' },
    skip: !accountId,
  });

  const refetchAccount = ['AccountInformation'];

  const [deleteSpace, { loading: deletingSpace }] = useDeleteSpaceMutation({
    refetchQueries: refetchAccount,
    onCompleted: () => notify(t('shared.account.deleteSuccess'), 'success'),
    onError: () => notify(t('shared.account.deleteError'), 'error'),
  });
  const [deleteVc, { loading: deletingVc }] = useDeleteVirtualContributorOnAccountMutation({
    refetchQueries: refetchAccount,
    onCompleted: () => notify(t('shared.account.deleteSuccess'), 'success'),
    onError: () => notify(t('shared.account.deleteError'), 'error'),
  });
  const [deletePack, { loading: deletingPack }] = useDeleteInnovationPackMutation({
    refetchQueries: refetchAccount,
    onCompleted: () => notify(t('shared.account.deleteSuccess'), 'success'),
    onError: () => notify(t('shared.account.deleteError'), 'error'),
  });
  const [deleteHub, { loading: deletingHub }] = useDeleteInnovationHubMutation({
    refetchQueries: refetchAccount,
    onCompleted: () => notify(t('shared.account.deleteSuccess'), 'success'),
    onError: () => notify(t('shared.account.deleteError'), 'error'),
  });
  const deletingAny = deletingSpace || deletingVc || deletingPack || deletingHub;

  const callbacks: OrgAccountMapperCallbacks = {
    onCreateSpace: () => navigate(CREATE_URLS.space),
    onCreateVc: () => navigate(CREATE_URLS.virtualContributor),
    onCreateInnovationPack: () => navigate(CREATE_URLS.innovationPack),
    onCreateInnovationHub: () => navigate(CREATE_URLS.innovationHub),
    onManage: (_kind, _id, href) => {
      if (href) navigate(href);
    },
    onDelete: (kind, id, name) => setPendingDelete({ kind, id, name }),
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;
    startTransition(() => {
      switch (kind) {
        case 'space':
          void deleteSpace({ variables: { spaceId: id } }).finally(() => setPendingDelete(null));
          return;
        case 'virtualContributor':
          void deleteVc({ variables: { virtualContributorData: { ID: id } } }).finally(() => setPendingDelete(null));
          return;
        case 'innovationPack':
          void deletePack({ variables: { innovationPackId: id } }).finally(() => setPendingDelete(null));
          return;
        case 'innovationHub':
          void deleteHub({ variables: { innovationHubId: id } }).finally(() => setPendingDelete(null));
          return;
      }
    });
  };

  const props = mapOrgAccountToViewProps(
    accountData?.lookup.account ?? undefined,
    loadingOrg || loadingAccount,
    t,
    callbacks
  );

  return (
    <>
      <ContributorAccountView {...props} />
      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={open => {
          if (!open && !deletingAny) setPendingDelete(null);
        }}
        variant="destructive"
        title={t('org.account.deleteDialog.title')}
        description={t('org.account.deleteDialog.description', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('org.account.deleteDialog.confirm')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deletingAny}
      />
    </>
  );
};

export default CrdOrgAccountTab;
