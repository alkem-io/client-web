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

export type AccountResourceKind = 'space' | 'virtualContributor' | 'innovationPack' | 'innovationHub';

/** Callbacks resolved by the per-actor integration page. */
export type ContributorAccountCallbacks = {
  onCreateSpace: () => void;
  onCreateVc: () => void;
  onCreateInnovationPack: () => void;
  onCreateInnovationHub: () => void;
  /** Manage navigates to the resource's existing settings/admin URL. */
  onManage: (kind: AccountResourceKind, id: string, href: string) => void;
  /** Delete opens the confirmation dialog (page-level state). */
  onDelete: (kind: AccountResourceKind, id: string, name: string) => void;
};

/**
 * Pre-localized labels — both `user.account.*` and `org.account.*` resolve
 * the same shape from their own i18n namespaces. The mapper itself never
 * calls `t()`, keeping it actor-agnostic.
 */
export type ContributorAccountLabels = {
  helpBanner: string;
  spaces: { title: string; createButton: string };
  virtualContributors: { title: string; createButton: string };
  innovationPacks: { title: string; createButton: string };
  innovationHubs: { title: string; createButton: string };
  actions: { manage: string; delete: string };
};

type AccountData = NonNullable<AccountInformationQuery['lookup']['account']>;

/**
 * Shared pure mapper consumed by both User Account (US2) and Org Account
 * (US9). The actor-specific integration pages resolve their own labels
 * via i18n and supply them as a `ContributorAccountLabels` struct, then
 * pass `account` data + callbacks here.
 *
 * Privilege gating is identical for both actors and matches the MUI
 * `ContributorAccountView`:
 * - `CreateSpace` → "Create Space" visible
 * - `CreateVirtual` → "Add Contributor"
 * - `CreateInnovationPack` → "New Pack"
 * - `CreateInnovationHub` → "New Page"
 * - `Delete` → per-row Delete kebab item
 *
 * Innovation Hubs additionally surface a "Manage" entry (parity with the
 * MUI page) — the only group that does so.
 */
export function mapAccountToViewProps(
  account: AccountData | undefined,
  loading: boolean,
  labels: ContributorAccountLabels,
  callbacks: ContributorAccountCallbacks
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
    if (kind === 'innovationHub' && href) {
      actions.push({
        kind: 'manage',
        label: labels.actions.manage,
        icon: Settings,
        onClick: () => callbacks.onManage(kind, id, href),
      });
    }
    if (canDelete) {
      actions.push({
        kind: 'delete',
        label: labels.actions.delete,
        icon: Trash2,
        onClick: () => callbacks.onDelete(kind, id, displayName),
      });
    }
    return actions;
  };

  const spacesGroup: AccountResourceGroup = {
    groupId: 'spaces',
    title: labels.spaces.title,
    canCreate: canCreateSpace,
    createButtonLabel: labels.spaces.createButton,
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
    title: labels.virtualContributors.title,
    canCreate: canCreateVc,
    createButtonLabel: labels.virtualContributors.createButton,
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
    title: labels.innovationPacks.title,
    canCreate: canCreateInnovationPack,
    createButtonLabel: labels.innovationPacks.createButton,
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
    title: labels.innovationHubs.title,
    canCreate: canCreateInnovationHub,
    createButtonLabel: labels.innovationHubs.createButton,
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
    helpBannerLabel: labels.helpBanner,
    groups: [spacesGroup, vcGroup, packGroup, hubGroup],
    loading,
  };
}
