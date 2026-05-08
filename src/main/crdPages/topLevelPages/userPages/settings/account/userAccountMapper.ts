import type { TFunction } from 'i18next';
import { Settings, Trash2 } from 'lucide-react';
import type { AccountInformationQuery } from '@/core/apollo/generated/graphql-schema';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import type {
  AccountKebabAction,
  AccountResourceCardItem,
  AccountResourceGroup,
  ContributorAccountViewProps,
} from '@/crd/components/contributor/settings/ContributorAccountView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/** Translator scoped to the contributor-settings namespace. */
export type ContributorSettingsTranslator = TFunction<'crd-contributorSettings'>;

export type AccountResourceKind = 'space' | 'virtualContributor' | 'innovationPack' | 'innovationHub';

/** Callbacks resolved at the integration page (CrdUserAccountTab). */
export type UserAccountMapperCallbacks = {
  onCreateSpace: () => void;
  onCreateVc: () => void;
  onCreateInnovationPack: () => void;
  onCreateInnovationHub: () => void;
  /** Manage navigates to the resource's existing settings/admin URL. */
  onManage: (kind: AccountResourceKind, id: string, href: string) => void;
  /** Delete opens the confirmation dialog (page-level state). */
  onDelete: (kind: AccountResourceKind, id: string, name: string) => void;
};

type AccountData = NonNullable<AccountInformationQuery['lookup']['account']>;

/**
 * Pure mapper from `useAccountInformationQuery` data to the shared
 * `ContributorAccountView` props (User Story 2). The `t()` function and
 * callbacks are injected by the integration page so the mapper stays
 * stateless and unit-testable.
 *
 * Privilege gating mirrors the MUI page (`ContributorAccountView` in
 * `src/domain/community/contributor/Account/`):
 * - `CreateSpace` privilege → "Create Space" button visible
 * - `CreateVirtual` → "Add Contributor"
 * - `CreateInnovationPack` → "New Pack"
 * - `CreateInnovationHub` → "New Page"
 * - `Delete` → per-row Delete kebab item
 */
export function mapUserAccountToViewProps(
  account: AccountData | undefined,
  loading: boolean,
  t: ContributorSettingsTranslator,
  callbacks: UserAccountMapperCallbacks
): ContributorAccountViewProps {
  const privileges = account?.authorization?.myPrivileges ?? [];
  const canCreateSpace = privileges.includes(AuthorizationPrivilege.CreateSpace);
  const canCreateVc = privileges.includes(AuthorizationPrivilege.CreateVirtual);
  const canCreateInnovationPack = privileges.includes(AuthorizationPrivilege.CreateInnovationPack);
  const canCreateInnovationHub = privileges.includes(AuthorizationPrivilege.CreateInnovationHub);
  const canDelete = privileges.includes(AuthorizationPrivilege.Delete);

  const buildKebab = (
    kind: AccountResourceKind,
    id: string,
    displayName: string,
    href: string
  ): AccountKebabAction[] => {
    const actions: AccountKebabAction[] = [];
    // Innovation Hubs are the only resource where the MUI menu also exposes
    // a Settings entry that navigates to the hub's profile URL. Other
    // resources omit Manage entirely (parity with MUI).
    if (kind === 'innovationHub' && href) {
      actions.push({
        kind: 'manage',
        label: t('user.account.actions.manage'),
        icon: Settings,
        onClick: () => callbacks.onManage(kind, id, href),
      });
    }
    if (canDelete) {
      actions.push({
        kind: 'delete',
        label: t('user.account.actions.delete'),
        icon: Trash2,
        onClick: () => callbacks.onDelete(kind, id, displayName),
      });
    }
    return actions;
  };

  const spacesGroup: AccountResourceGroup = {
    groupId: 'spaces',
    title: t('user.account.spaces.title'),
    canCreate: canCreateSpace,
    createButtonLabel: t('user.account.spaces.createButton'),
    onCreate: callbacks.onCreateSpace,
    items:
      account?.spaces.map<AccountResourceCardItem>(space => {
        const profile = space.about.profile;
        return {
          id: space.id,
          displayName: profile.displayName,
          description: profile.tagline,
          avatarUrl: profile.cardBanner?.uri || undefined,
          color: pickColorFromId(space.id),
          href: profile.url,
          actions: buildKebab('space', space.id, profile.displayName, profile.url),
        };
      }) ?? [],
  };

  const vcGroup: AccountResourceGroup = {
    groupId: 'virtualContributors',
    title: t('user.account.virtualContributors.title'),
    canCreate: canCreateVc,
    createButtonLabel: t('user.account.virtualContributors.createButton'),
    onCreate: callbacks.onCreateVc,
    items:
      account?.virtualContributors.map<AccountResourceCardItem>(vc => {
        const profile = vc.profile;
        return {
          id: vc.id,
          displayName: profile?.displayName ?? '',
          description: profile?.tagline ?? profile?.description,
          avatarUrl: profile?.avatar?.uri || undefined,
          color: pickColorFromId(vc.id),
          href: profile?.url ?? '',
          actions: buildKebab('virtualContributor', vc.id, profile?.displayName ?? '', profile?.url ?? ''),
        };
      }) ?? [],
  };

  const packGroup: AccountResourceGroup = {
    groupId: 'innovationPacks',
    title: t('user.account.innovationPacks.title'),
    canCreate: canCreateInnovationPack,
    createButtonLabel: t('user.account.innovationPacks.createButton'),
    onCreate: callbacks.onCreateInnovationPack,
    items:
      account?.innovationPacks.map<AccountResourceCardItem>(pack => ({
        id: pack.id,
        displayName: pack.profile.displayName,
        description: pack.profile.description,
        avatarUrl: pack.profile.avatar?.uri || undefined,
        color: pickColorFromId(pack.id),
        href: pack.profile.url,
        actions: buildKebab('innovationPack', pack.id, pack.profile.displayName, pack.profile.url),
      })) ?? [],
  };

  const hubGroup: AccountResourceGroup = {
    groupId: 'innovationHubs',
    title: t('user.account.innovationHubs.title'),
    canCreate: canCreateInnovationHub,
    createButtonLabel: t('user.account.innovationHubs.createButton'),
    onCreate: callbacks.onCreateInnovationHub,
    items:
      account?.innovationHubs.map<AccountResourceCardItem>(hub => ({
        id: hub.id,
        displayName: hub.profile.displayName,
        description: hub.profile.description,
        avatarUrl: hub.profile.banner?.uri || undefined,
        color: pickColorFromId(hub.id),
        href: hub.profile.url,
        actions: buildKebab('innovationHub', hub.id, hub.profile.displayName, hub.profile.url),
      })) ?? [],
  };

  return {
    helpBannerLabel: t('user.account.helpBanner'),
    groups: [spacesGroup, vcGroup, packGroup, hubGroup],
    loading,
  };
}
