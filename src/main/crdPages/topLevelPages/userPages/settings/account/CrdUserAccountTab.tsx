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
import { LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { ContributorAccountView } from '@/crd/components/contributor/settings/ContributorAccountView';
import type { AccountResourceGroupId } from '@/crd/components/contributor/settings/ContributorAccountView.types';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { CrdCreateInnovationHubDialog } from '@/main/crdPages/innovationHub/CrdCreateInnovationHubDialog';
import { CrdCreateInnovationPackDialog } from '@/main/crdPages/innovationPack/CrdCreateInnovationPackDialog';
// TEMP fallback: the VC creation wizard still opens the existing flow until its
// CRD port lands (spec 097-crd-user-settings). Create Space / Innovation Pack /
// Innovation Hub are migrated to CRD dialogs (specs 105 + 109).
import { CrdCreateSpaceDialog } from '@/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog';
import { CrdVCCreationWizardDialog } from '@/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardDialog';
import type { UserAccountProps } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/virtualContributorProps';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import {
  type AccountResourceKind,
  mapUserAccountToViewProps,
  type UserAccountMapperCallbacks,
} from './userAccountMapper';

type PendingDelete = { kind: AccountResourceKind; id: string; name: string };

const CONTACT_URL = 'https://welcome.alkem.io/contact/';

/**
 * Integration page for the User Account tab. Wires data → mapper →
 * `ContributorAccountView`. Owns the `pendingDelete` state and renders
 * the destructive `ConfirmationDialog` at the page level (Rule #9).
 *
 * Create flows use CRD dialogs (Create Space — spec 105; Create Innovation
 * Pack / Hub — spec 109). The Virtual Contributor creation wizard still uses the
 * existing flow until its CRD port lands (spec 097-crd-user-settings).
 */
const CrdUserAccountTab = () => {
  const { t } = useTranslation('crd-contributorSettings');
  const navigate = useNavigate();
  const notify = useNotification();
  const { userId } = useUserPageRouteContext();
  const [, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [noEntitlementResource, setNoEntitlementResource] = useState<AccountResourceGroupId | null>(null);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [createPackOpen, setCreatePackOpen] = useState(false);
  const [createHubOpen, setCreateHubOpen] = useState(false);
  const [createVcOpen, setCreateVcOpen] = useState(false);

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

  // Per-group entitlement flags — mirror the MUI page's `isEntitledToCreate*`
  // checks (src/domain/community/contributor/Account/ContributorAccountView.tsx
  // lines 241-249). When the relevant entitlement is absent, the Create button
  // opens a CRD dialog explaining the capacity is reached and offering to
  // contact the Alkemio team.
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

  const tryCreate = (resourceKey: AccountResourceGroupId, isEntitled: boolean, openDialog: () => void) => {
    if (!isEntitled) {
      setNoEntitlementResource(resourceKey);
      return;
    }
    openDialog();
  };

  const callbacks: UserAccountMapperCallbacks = {
    onCreateSpace: () => tryCreate('spaces', entitled.spaces, () => setCreateSpaceOpen(true)),
    onCreateVc: () => tryCreate('virtualContributors', entitled.virtualContributors, () => setCreateVcOpen(true)),
    onCreateInnovationPack: () => tryCreate('innovationPacks', entitled.innovationPacks, () => setCreatePackOpen(true)),
    onCreateInnovationHub: () => tryCreate('innovationHubs', entitled.innovationHubs, () => setCreateHubOpen(true)),
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

  // Per-resource description for the no-entitlement dialog. Keys are spelled
  // out per branch so i18next's strict literal-string typing of `t()` is
  // preserved (template-literal lookups don't narrow, and passing `t` as a
  // parameter trips a TypeScript overload-resolution bug).
  const noEntDescription = (() => {
    switch (noEntitlementResource) {
      case 'virtualContributors':
        return t('shared.account.noEntitlement.description.virtualContributors');
      case 'innovationPacks':
        return t('shared.account.noEntitlement.description.innovationPacks');
      case 'innovationHubs':
        return t('shared.account.noEntitlement.description.innovationHubs');
      default:
        return t('shared.account.noEntitlement.description.spaces');
    }
  })();

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
      <ConfirmationDialog
        open={Boolean(noEntitlementResource)}
        onOpenChange={open => {
          if (!open) setNoEntitlementResource(null);
        }}
        title={t('shared.account.noEntitlement.title')}
        description={noEntDescription}
        confirmLabel={t('shared.account.noEntitlement.contactCta')}
        cancelLabel={t('shared.account.noEntitlement.cancel')}
        onConfirm={() => {
          window.open(CONTACT_URL, '_blank', 'noopener,noreferrer');
          setNoEntitlementResource(null);
        }}
        onCancel={() => setNoEntitlementResource(null)}
      />
      {/* CRD create dialogs (specs 105 + 109); VC wizard below is the remaining fallback (spec 097). */}
      {account?.id && (
        <>
          <CrdCreateSpaceDialog
            accountId={account.id}
            open={createSpaceOpen}
            onClose={() => setCreateSpaceOpen(false)}
          />
          {/* No accountName on the user's own account → "…in your account" subtitle (matches Create Space). */}
          <CrdCreateInnovationPackDialog
            accountId={account.id}
            open={createPackOpen}
            onClose={() => setCreatePackOpen(false)}
          />
          <CrdCreateInnovationHubDialog
            accountId={account.id}
            open={createHubOpen}
            onClose={() => setCreateHubOpen(false)}
          />
          {/* Cast: `AccountInformation` returns `about.membership.myPrivileges`, but
              `UserAccountProps` expects the full `SpaceAboutLightModel` membership
              shape. The wizard only reads `id`, `host`, `spaces[].id`, and
              `spaces[].authorization?.myPrivileges` at runtime — all present. */}
          <CrdVCCreationWizardDialog
            open={createVcOpen}
            onClose={() => setCreateVcOpen(false)}
            account={account as UserAccountProps | undefined}
            accountName={accountHostName}
          />
        </>
      )}
    </>
  );
};

export default CrdUserAccountTab;
