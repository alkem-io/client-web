import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAccountInformationQuery,
  useDeleteInnovationHubMutation,
  useDeleteInnovationPackMutation,
  useDeleteSpaceMutation,
  useDeleteVirtualContributorOnAccountMutation,
  useUserAccountQuery,
} from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ContributorAccountView } from '@/crd/components/contributor/settings/ContributorAccountView';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import {
  type AccountResourceKind,
  mapUserAccountToViewProps,
  type UserAccountMapperCallbacks,
} from './userAccountMapper';

/**
 * Per research §3 (Decision #3): create flows navigate to existing MUI
 * admin routes. These URLs are defined in the spec; the routing layer
 * for these admin flows is owned by adjacent specs.
 */
const CREATE_URLS = {
  space: '/admin/spaces/new',
  virtualContributor: '/admin/virtual-contributors/new',
  innovationPack: '/admin/innovation-packs/new',
  innovationHub: '/admin/innovation-hubs/new',
} as const;

type PendingDelete = { kind: AccountResourceKind; id: string; name: string };

/**
 * Integration page for the User Account tab. Wires data → mapper →
 * `ContributorAccountView`. Owns the `pendingDelete` state and renders
 * the destructive `ConfirmationDialog` at the page level (Rule #9).
 *
 * Heavy create / manage flows navigate to existing MUI admin routes per
 * research §3 (Decision #3) — no new CRD creation dialogs introduced.
 * The actual delete mutations are reused from the MUI admin path.
 */
const CrdUserAccountTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const navigate = useNavigate();
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();
  const [, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const { data: userData, loading: loadingUser } = useUserAccountQuery({
    variables: { userId: userId ?? '' },
    skip: !userId,
  });

  const accountId = userData?.lookup.user?.account?.id;
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

  const callbacks: UserAccountMapperCallbacks = {
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

  const props = mapUserAccountToViewProps(
    accountData?.lookup.account ?? undefined,
    loadingUser || loadingAccount,
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
        title={t('user.account.deleteDialog.title')}
        description={t('user.account.deleteDialog.description', { name: pendingDelete?.name ?? '' })}
        confirmLabel={t('user.account.deleteDialog.confirm')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deletingAny}
      />
    </>
  );
};

export default CrdUserAccountTab;
