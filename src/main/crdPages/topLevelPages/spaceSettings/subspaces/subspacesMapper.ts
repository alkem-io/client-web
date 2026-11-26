import type { NativeSubspaceCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import type { SubspaceTile } from '@/crd/components/space/settings/SpaceSettingsSubspacesView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/** `core.space_settings.sort_mode` (schema.sql space_settings: enum custom | alphabetical, default alphabetical). */
export type SpaceSortModeSetting = 'custom' | 'alphabetical';

export function mapSubspaceToTile(s: NativeSubspaceCardFragment): SubspaceTile {
  const name = s.about.displayName;
  return {
    id: s.id,
    name,
    description: s.about.tagline ?? '',
    href: s.url ?? '',
    avatarUrl: s.about.avatar?.file.url ?? null,
    bannerUrl: s.about.card?.file.url ?? null,
    color: pickColorFromId(s.id),
    initials: name.substring(0, 2).toUpperCase(),
    visibility: 'active',
    isPinned: s.pinned ?? false,
  };
}

/** The parent's `Space.settings.sort_mode`; an absent key is the declared default, alphabetical. */
export function mapSortMode(settings: unknown): 'alphabetical' | 'manual' {
  return (settings as { sort_mode?: string } | null | undefined)?.sort_mode === 'custom' ? 'manual' : 'alphabetical';
}

export function mapSortModeToBackend(mode: 'alphabetical' | 'manual'): SpaceSortModeSetting {
  return mode === 'manual' ? 'custom' : 'alphabetical';
}
