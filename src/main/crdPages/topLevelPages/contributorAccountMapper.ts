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
import { buildHubSettingsPath } from '@/main/crdPages/innovationHub/lib/hubUrls';

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

  // Entitlement gating for the per-section Create buttons. Mirrors the MUI
  // page (src/domain/community/contributor/Account/ContributorAccountView.tsx
  // lines 241-249): a click on Create is only routed to the create dialog
  // when the account still has an available entitlement; otherwise the
  // integration page falls back to the contact page.
  const availableEntitlements = account?.license?.availableEntitlements ?? [];
  const isEntitledToCreateSpace = [
    LicenseEntitlementType.AccountSpaceFree,
    LicenseEntitlementType.AccountSpacePlus,
    LicenseEntitlementType.AccountSpacePremium,
  ].some(type => availableEntitlements.includes(type));
  const isEntitledToCreateVc = availableEntitlements.includes(LicenseEntitlementType.AccountVirtualContributor);
  const isEntitledToCreateInnovationPack = availableEntitlements.includes(LicenseEntitlementType.AccountInnovationPack);
  const isEntitledToCreateInnovationHub = availableEntitlements.includes(LicenseEntitlementType.AccountInnovationHub);

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
    isEntitled: isEntitledToCreateSpace,
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
    isEntitled: isEntitledToCreateVc,
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
    isEntitled: isEntitledToCreateInnovationPack,
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
    isEntitled: isEntitledToCreateInnovationHub,
    createButtonLabel: labels.innovationHubs.createButton,
    onCreate: callbacks.onCreateInnovationHub,
    capacity: hubCapacity,
    items:
      account?.innovationHubs.map<AccountResourceCardItem>(hub => {
        // Link the card to `/hub/<nameID>/settings`, not the public hub home.
        // The public home redirects to the hub's subdomain in production, which
        // shows a broken page when the subdomain isn't configured yet — so from
        // the owner's account we land on settings, where the hub can be set up.
        // Always use `nameID` (the route param the server resolves) — never the
        // server-provided `profile.url` (legacy `/innovation-hub/...`), and never
        // `subdomain` (hostname identifier, can diverge from nameID).
        const hubSettingsPath = buildHubSettingsPath(hub.nameID);
        return {
          id: hub.id,
          displayName: hub.profile.displayName,
          description: hub.profile.description,
          avatarUrl: hub.profile.banner?.uri || undefined,
          color: pickColorFromId(hub.id),
          href: hubSettingsPath,
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
