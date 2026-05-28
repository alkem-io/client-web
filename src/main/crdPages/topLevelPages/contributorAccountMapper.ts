import { Settings, Trash2 } from 'lucide-react';
import type { AccountInformationQuery } from '@/core/apollo/generated/graphql-schema';
import { AuthorizationPrivilege, LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';
import type {
  AccountCapacity,
  AccountKebabAction,
  AccountResourceCardItem,
  AccountResourceGroup,
  ContributorAccountViewProps,
} from '@/crd/components/contributor/settings/ContributorAccountView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { buildHubHomePath, buildHubSettingsPath } from '@/main/crdPages/innovationHub/lib/hubUrls';

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

  // Capacity readouts from the account's license entitlements — drives the
  // X/Y badge + per-plan tooltip on each section header. Matches MUI parity
  // (`ContributorAccountView.tsx:208-230` + BlockHeader call sites in
  // src/domain/community/contributor/Account/). `isAvailable` is the
  // privilege-to-create flag (NOT `availableEntitlements`) — same as MUI's
  // `isAvailable={canCreate*}` on each BlockHeader.
  const entitlements = account?.license?.entitlements ?? [];
  const findEnt = (type: LicenseEntitlementType) => entitlements.find(e => e.type === type) ?? { limit: 0, usage: 0 };

  const spaceFree = findEnt(LicenseEntitlementType.AccountSpaceFree);
  const spacePlus = findEnt(LicenseEntitlementType.AccountSpacePlus);
  const spacePremium = findEnt(LicenseEntitlementType.AccountSpacePremium);
  const spacesCapacity: AccountCapacity = {
    usage: spaceFree.usage + spacePlus.usage + spacePremium.usage,
    limit: spaceFree.limit + spacePlus.limit + spacePremium.limit,
    isAvailable: canCreateSpace,
    perPlan: {
      free: { usage: spaceFree.usage, limit: spaceFree.limit },
      plus: { usage: spacePlus.usage, limit: spacePlus.limit },
      premium: { usage: spacePremium.usage, limit: spacePremium.limit },
    },
  };

  const buildSimpleCapacity = (type: LicenseEntitlementType, canCreate: boolean): AccountCapacity => {
    const e = findEnt(type);
    return { usage: e.usage, limit: e.limit, isAvailable: canCreate };
  };
  const vcCapacity = buildSimpleCapacity(LicenseEntitlementType.AccountVirtualContributor, canCreateVc);
  const packCapacity = buildSimpleCapacity(LicenseEntitlementType.AccountInnovationPack, canCreateInnovationPack);
  const hubCapacity = buildSimpleCapacity(LicenseEntitlementType.AccountInnovationHub, canCreateInnovationHub);

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
    capacity: spacesCapacity,
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
    capacity: vcCapacity,
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
    capacity: packCapacity,
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
    capacity: hubCapacity,
    items:
      account?.innovationHubs.map<AccountResourceCardItem>(hub => {
        // Use the canonical `/hub/<nameID>` path for the card (public hub
        // home) and `/hub/<nameID>/settings` for the kebab Manage action —
        // never the server-provided `profile.url` (legacy `/innovation-hub/...`),
        // and never `subdomain` (hostname identifier, can diverge from nameID).
        const hubHomePath = buildHubHomePath(hub.nameID);
        const hubSettingsPath = buildHubSettingsPath(hub.nameID);
        return {
          id: hub.id,
          displayName: hub.profile.displayName,
          description: hub.profile.description,
          avatarUrl: hub.profile.banner?.uri || undefined,
          color: pickColorFromId(hub.id),
          href: hubHomePath,
          actions: buildKebab('innovationHub', hub.id, hub.profile.displayName, hubSettingsPath),
        };
      }) ?? [],
  };

  return {
    helpBannerLabel: labels.helpBanner,
    groups: [spacesGroup, vcGroup, packGroup, hubGroup],
    loading,
  };
}
