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
// TEMP fallback: open existing MUI dialogs until CRD parity ports land
// (spec 097-crd-user-settings, tasks T033a–T033f). Delete the four imports
// below and the corresponding JSX at the bottom of this file once those
// CRD dialogs are wired in.
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import CreateSpace from '@/domain/space/components/CreateSpace/createSpace/CreateSpace';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import type { UserAccountProps } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/virtualContributorProps';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import {
  type AccountResourceKind,
  mapUserAccountToViewProps,
  type UserAccountMapperCallbacks,
} from './userAccountMapper';

type PendingDelete = { kind: AccountResourceKind; id: string; name: string };

/**
 * Integration page for the User Account tab. Wires data → mapper →
 * `ContributorAccountView`. Owns the `pendingDelete` state and renders
 * the destructive `ConfirmationDialog` at the page level (Rule #9).
 *
 * Create flows currently use a TEMP fallback that mounts the existing MUI
 * dialogs (`CreateSpace`, `useVirtualContributorWizard`,
 * `CreateInnovationPackDialog`, `CreateInnovationHubDialog`) until the CRD
 * parity ports land (spec 097-crd-user-settings, tasks T033a–T033f).
 */
const CrdUserAccountTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const navigate = useNavigate();
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();
  const [, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const { startWizard, virtualContributorWizard } = useVirtualContributorWizard();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createPackOpen, setCreatePackOpen] = useState(false);
  const [createHubOpen, setCreateHubOpen] = useState(false);

  const { data: userData, loading: loadingUser } = useUserAccountQuery({
    variables: { userId: userId ?? '' },
    skip: !userId,
  });

  const accountId = userData?.lookup.user?.account?.id;
  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: { accountId: accountId ?? '' },
    skip: !accountId,
  });

  const account = accountData?.lookup.account ?? undefined;
  const accountHostName = userData?.lookup.user?.profile?.displayName;

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
    onCreateSpace: () => setCreateSpaceOpen(true),
    // Cast: `AccountInformation` returns `about.membership.myPrivileges`,
    // but `UserAccountProps` expects the full `SpaceAboutLightModel`
    // membership shape. The wizard only reads `id`, `host`, `spaces[].id`,
    // and `spaces[].authorization?.myPrivileges` at runtime — all present.
    onCreateVc: () => startWizard(account as UserAccountProps | undefined, accountHostName),
    onCreateInnovationPack: () => setCreatePackOpen(true),
    onCreateInnovationHub: () => setCreateHubOpen(true),
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

  const props = mapUserAccountToViewProps(account, loadingUser || loadingAccount, t, callbacks);

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
      {/* TEMP fallback — see top-of-file comment (spec 097, tasks T033a–T033f) */}
      {account?.id && (
        <>
          <CreateSpace accountId={account.id} open={createSpaceOpen} onClose={() => setCreateSpaceOpen(false)} />
          <CreateInnovationPackDialog
            accountId={account.id}
            open={createPackOpen}
            onClose={() => setCreatePackOpen(false)}
          />
          <CreateInnovationHubDialog
            accountId={account.id}
            open={createHubOpen}
            onClose={() => setCreateHubOpen(false)}
          />
        </>
      )}
      {virtualContributorWizard}
    </>
  );
};

export default CrdUserAccountTab;
