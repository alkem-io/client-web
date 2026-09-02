import type { SubspacesInSpaceQuery } from '@/core/apollo/generated/graphql-schema';
import { SpaceSortMode } from '@/core/apollo/generated/graphql-schema';
import type { SubspaceTile } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

type RawSubspace = NonNullable<NonNullable<SubspacesInSpaceQuery['lookup']['space']>['subspaces']>[number];

export function mapSubspaceToTile(s: RawSubspace): SubspaceTile {
  const name = s.about.profile.displayName;
  return {
    id: s.id,
    name,
    description: s.about.profile.tagline ?? '',
    href: s.about.profile.url,
    avatarUrl: s.about.profile.avatar?.uri ?? null,
    bannerUrl: s.about.profile.cardBanner?.uri ?? null,
    color: pickColorFromId(s.id),
    initials: name.substring(0, 2).toUpperCase(),
    visibility: 'active',
    isPinned: s.pinned,
  };
}

export function mapSortMode(mode: SpaceSortMode): 'alphabetical' | 'manual' {
  return mode === SpaceSortMode.Custom ? 'manual' : 'alphabetical';
}

export function mapSortModeToBackend(mode: 'alphabetical' | 'manual'): SpaceSortMode {
  return mode === 'manual' ? SpaceSortMode.Custom : SpaceSortMode.Alphabetical;
}
