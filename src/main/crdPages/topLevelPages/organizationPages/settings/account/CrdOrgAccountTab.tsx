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
import type { AccountResourceGroupId } from '@/crd/components/contributor/settings/ContributorAccountView.types';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
// TEMP fallback: open existing MUI dialogs until CRD parity ports land
// (spec 097-crd-user-settings). Delete the remaining MUI imports below and the
// corresponding JSX at the bottom of this file once those CRD dialogs are wired in.
// Create Space is migrated — it uses the CRD dialog (spec 105-create-space-dialog).
import CreateInnovationPackDialog from '@/domain/InnovationPack/CreateInnovationPackDialog/CreateInnovationPackDialog';
import CreateInnovationHubDialog from '@/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog';
import { CrdCreateSpaceDialog } from '@/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog';
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
  const [noEntitlementResource, setNoEntitlementResource] = useState<AccountResourceGroupId | null>(null);
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
  // checks. When the relevant entitlement is absent, the Create button opens
  // a CRD dialog explaining the capacity is reached and offering to contact
  // the Alkemio team.
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

  const callbacks: OrgAccountMapperCallbacks = {
    onCreateSpace: () => tryCreate('spaces', entitled.spaces, () => setCreateSpaceOpen(true)),
    // Cast: `AccountInformation` returns `about.membership.myPrivileges`,
    // but `UserAccountProps` expects the full `SpaceAboutLightModel`
    // membership shape. The wizard only reads `id`, `host`, `spaces[].id`,
    // and `spaces[].authorization?.myPrivileges` at runtime — all present.
    onCreateVc: () =>
      tryCreate('virtualContributors', entitled.virtualContributors, () =>
        startWizard(account as UserAccountProps | undefined, accountHostName)
      ),
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
      {/* TEMP fallback — see top-of-file comment (spec 097, tasks T033a–T033f) */}
      {account?.id && (
        <>
          <CrdCreateSpaceDialog
            accountId={account.id}
            accountName={accountHostName}
            open={createSpaceOpen}
            onClose={() => setCreateSpaceOpen(false)}
          />
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
