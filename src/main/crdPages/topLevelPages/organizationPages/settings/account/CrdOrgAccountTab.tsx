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
import { LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ContributorAccountView } from '@/crd/components/contributor/settings/ContributorAccountView';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
// TEMP fallback: open existing MUI dialogs until CRD parity ports land
// (spec 097-crd-user-settings, tasks T033a–T033f). Delete the four imports
// below and the corresponding JSX at the bottom of this file once those
// CRD dialogs are wired in.
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import CreateSpace from '@/domain/space/components/CreateSpace/createSpace/CreateSpace';
import useVirtualContributorWizard from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard';
import type { UserAccountProps } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/virtualContributorProps';
import { type AccountResourceKind, mapOrgAccountToViewProps, type OrgAccountMapperCallbacks } from './orgAccountMapper';

type PendingDelete = { kind: AccountResourceKind; id: string; name: string };

const CONTACT_URL = 'https://welcome.alkem.io/contact/';

/**
 * Integration page for the Org Account tab (US9). Mirrors
 * `CrdUserAccountTab` (US2) but reads from `useOrganizationAccountQuery`
 * → `account.id` → `useAccountInformationQuery`. The rest of the flow —
 * delete mutations, ConfirmationDialog, kebab actions, create dialogs —
 * is identical to the User side.
 */
const CrdOrgAccountTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const navigate = useNavigate();
  const notify = useNotification();
  const { organizationId } = useOrganizationContext();
  const [, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const { startWizard, virtualContributorWizard } = useVirtualContributorWizard();
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createPackOpen, setCreatePackOpen] = useState(false);
  const [createHubOpen, setCreateHubOpen] = useState(false);

  const { data: orgData, loading: loadingOrg } = useOrganizationAccountQuery({
    variables: { organizationId: organizationId ?? '' },
    skip: !organizationId,
  });

  const accountId = orgData?.lookup.organization?.account?.id;
  const { data: accountData, loading: loadingAccount } = useAccountInformationQuery({
    variables: { accountId: accountId ?? '' },
    skip: !accountId,
  });

  const account = accountData?.lookup.account ?? undefined;
  const accountHostName = orgData?.lookup.organization?.profile?.displayName;

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

  // Per-group entitlement flags — mirror the MUI page's `isEntitledToCreate*`
  // checks. When the relevant entitlement is absent, the Create button
  // doesn't open its dialog — we surface a warning toast and open the
  // contact page so the user can request more capacity.
  const availableEntitlements = account?.license?.availableEntitlements ?? [];
  const entitled = {
    spaces: [
      LicenseEntitlementType.AccountSpaceFree,
      LicenseEntitlementType.AccountSpacePlus,
      LicenseEntitlementType.AccountSpacePremium,
    ].some(type => availableEntitlements.includes(type)),
    virtualContributors: availableEntitlements.includes(LicenseEntitlementType.AccountVirtualContributor),
    innovationPacks: availableEntitlements.includes(LicenseEntitlementType.AccountInnovationPack),
    innovationHubs: availableEntitlements.includes(LicenseEntitlementType.AccountInnovationHub),
  };

  const tryCreate = (isEntitled: boolean, openDialog: () => void) => {
    if (!isEntitled) {
      notify(t('shared.account.noEntitlement.toast'), 'warning');
      window.open(CONTACT_URL, '_blank', 'noopener,noreferrer');
      return;
    }
    openDialog();
  };

  const callbacks: OrgAccountMapperCallbacks = {
    onCreateSpace: () => tryCreate(entitled.spaces, () => setCreateSpaceOpen(true)),
    // Cast: `AccountInformation` returns `about.membership.myPrivileges`,
    // but `UserAccountProps` expects the full `SpaceAboutLightModel`
    // membership shape. The wizard only reads `id`, `host`, `spaces[].id`,
    // and `spaces[].authorization?.myPrivileges` at runtime — all present.
    onCreateVc: () =>
      tryCreate(entitled.virtualContributors, () =>
        startWizard(account as UserAccountProps | undefined, accountHostName)
      ),
    onCreateInnovationPack: () => tryCreate(entitled.innovationPacks, () => setCreatePackOpen(true)),
    onCreateInnovationHub: () => tryCreate(entitled.innovationHubs, () => setCreateHubOpen(true)),
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

  const props = mapOrgAccountToViewProps(account, loadingOrg || loadingAccount, t, callbacks);

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

export default CrdOrgAccountTab;
