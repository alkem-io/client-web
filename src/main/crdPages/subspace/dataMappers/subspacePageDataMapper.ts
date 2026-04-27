import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import type { SubspaceHeaderActionsData, SubspaceHeaderProps } from '@/crd/components/space/SubspaceHeader';
import type {
  SubspaceLeadData,
  SubspaceSidebarData,
  SubspaceVirtualContributorData,
} from '@/crd/components/space/SubspaceSidebar';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { buildSubspaceSettingsUrl } from '@/main/routing/urlBuilders';
import { getInitials } from '../../space/dataMappers/spacePageDataMapper';

// ---------------------------------------------------------------------------
// Banner
// ---------------------------------------------------------------------------

type ProfileLike = {
  displayName?: string | null;
  tagline?: string | null;
  avatar?: { uri?: string | null } | null;
  banner?: { uri?: string | null } | null;
  url?: string | null;
};

export type SubspaceBannerSourceData = {
  subspaceId: string;
  level: SpaceLevel;
  subspaceProfile: ProfileLike | undefined;
  parentSpaceId: string | undefined;
  parentProfile: ProfileLike | undefined;
};

export type SubspaceBannerProps = Pick<
  SubspaceHeaderProps,
  | 'title'
  | 'tagline'
  | 'subspaceInitials'
  | 'subspaceColor'
  | 'subspaceAvatarUrl'
  | 'parentName'
  | 'parentInitials'
  | 'parentColor'
  | 'parentBannerUrl'
  | 'badgeLabel'
>;

export function mapSubspaceBanner({
  subspaceId,
  level,
  subspaceProfile,
  parentSpaceId,
  parentProfile,
}: SubspaceBannerSourceData): SubspaceBannerProps {
  const title = subspaceProfile?.displayName ?? '';
  const parentName = parentProfile?.displayName ?? '';
  return {
    title,
    tagline: subspaceProfile?.tagline ?? undefined,
    subspaceInitials: getInitials(title) || '??',
    subspaceColor: pickColorFromId(subspaceId || title),
    subspaceAvatarUrl: subspaceProfile?.avatar?.uri ?? undefined,
    parentName,
    parentInitials: getInitials(parentName) || '??',
    parentColor: pickColorFromId(parentSpaceId ?? parentName),
    parentBannerUrl: parentProfile?.banner?.uri ?? undefined,
    badgeLabel: level === SpaceLevel.L2 ? 'SubSubSpace' : 'SubSpace',
  };
}

// ---------------------------------------------------------------------------
// Header actions
// ---------------------------------------------------------------------------

export type SubspaceHeaderActionsSource = {
  shareUrl: string | undefined;
  canUpdate: boolean;
  videoCallEnabled: boolean;
  videoCallUrl: string | undefined;
};

export function mapSubspaceHeaderActions({
  shareUrl,
  canUpdate,
  videoCallEnabled,
  videoCallUrl,
}: SubspaceHeaderActionsSource): SubspaceHeaderActionsData {
  return {
    showActivity: true,
    showVideoCall: videoCallEnabled && !!videoCallUrl,
    videoCallUrl,
    showShare: true,
    showSettings: canUpdate,
    shareUrl,
    settingsHref: shareUrl && canUpdate ? buildSubspaceSettingsUrl(shareUrl) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Innovation flow tabs
// ---------------------------------------------------------------------------

type InnovationFlowStateLike = {
  id?: string;
  displayName?: string | null;
  description?: string | null;
};

export function mapInnovationFlowPhases(states: InnovationFlowStateLike[] | undefined): SubspaceFlowPhase[] {
  if (!states) return [];
  return states
    .filter((state): state is InnovationFlowStateLike & { id: string } => !!state.id)
    .map(state => ({
      id: state.id,
      label: state.displayName ?? '',
      description: state.description ?? undefined,
    }));
}

// ---------------------------------------------------------------------------
// Right sidebar
// ---------------------------------------------------------------------------

type LeadUserLike = {
  id?: string;
  profile?: {
    displayName?: string | null;
    avatar?: { uri?: string | null } | null;
    url?: string | null;
    location?: { city?: string | null; country?: string | null } | null;
  } | null;
};

type VirtualContributorLike = {
  id?: string;
  profile?: {
    displayName?: string | null;
    description?: string | null;
    tagline?: string | null;
    avatar?: { uri?: string | null } | null;
    url?: string | null;
  } | null;
};

export function mapSubspaceLeads(leadUsers: LeadUserLike[] | undefined): SubspaceLeadData[] {
  if (!leadUsers) return [];
  return leadUsers
    .filter(
      (user): user is LeadUserLike & { id: string; profile: NonNullable<LeadUserLike['profile']> } =>
        !!user.id && !!user.profile
    )
    .map(user => {
      const name = user.profile.displayName ?? '';
      const cityCountry = [user.profile.location?.city, user.profile.location?.country].filter(Boolean).join(', ');
      return {
        id: user.id,
        name,
        avatarUrl: user.profile.avatar?.uri ?? undefined,
        initials: getInitials(name) || '??',
        href: user.profile.url ?? '',
        location: cityCountry || undefined,
      };
    });
}

export function mapSubspaceVirtualContributor(
  vc: VirtualContributorLike | undefined
): SubspaceVirtualContributorData | undefined {
  if (!vc?.id || !vc.profile) return undefined;
  const name = vc.profile.displayName ?? '';
  return {
    id: vc.id,
    name,
    initials: getInitials(name) || '??',
    avatarUrl: vc.profile.avatar?.uri ?? undefined,
    description: vc.profile.description ?? vc.profile.tagline ?? undefined,
    href: vc.profile.url ?? '',
  };
}

export type SubspaceSidebarSource = {
  description?: string | null;
  leadUsers: LeadUserLike[] | undefined;
  virtualContributor?: VirtualContributorLike;
};

export function mapSubspaceSidebar({
  description,
  leadUsers,
  virtualContributor,
}: SubspaceSidebarSource): SubspaceSidebarData {
  return {
    description: description ?? '',
    leads: mapSubspaceLeads(leadUsers),
    virtualContributor: mapSubspaceVirtualContributor(virtualContributor),
  };
}
