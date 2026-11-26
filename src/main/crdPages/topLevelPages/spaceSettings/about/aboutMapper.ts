import type { SpaceAboutDetailsQuery } from '@/core/apollo/generated/graphql-schema';
import type { SpaceSettingsAboutQuery } from '@/core/apollo/generated-v2/graphql-schema';
import type { ClassificationEntryData } from '@/crd/components/classification/types';
import type {
  AboutFormValues,
  AboutReference,
  AboutVisual,
  SpaceCardPreview,
  SpaceSettingsLevel,
} from '@/crd/components/space/settings/SpaceSettingsAboutView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { mapGqlClassificationCardinality } from '@/domain/space/about/model/classificationCardinality';

export type { AboutFormValues, AboutReference, AboutVisual, SpaceCardPreview };

/** The native Space face the About tab reads (SpaceSettingsAbout.v2.graphql). */
export type AboutSpace = Extract<NonNullable<SpaceSettingsAboutQuery['node']>, { __typename?: 'Space' }>;
type AboutVisualRef = AboutSpace['about']['avatar'];

/** The About facet carrying why/who: the core.purpose section (H-about-meta-8; schema.sql core.purpose). */
export const PURPOSE_FACET = { namespace: 'core', name: 'purpose' } as const;

type Purpose = { why?: string | null; who?: string | null };
type Location = { country?: string | null; city?: string | null };

/**
 * The classification instance settings the tab reads (schema.sql choice_set.settings for classification:
 * display_label, selection one|many, max; H-about-meta-1 adds visible (default true) and order).
 */
export type ClassificationSettings = {
  selection?: string;
  visible?: boolean;
  order?: number;
  [key: string]: unknown;
};

/** Empty visual used when the space has no image in a slot yet. */
const EMPTY_VISUAL: AboutVisual = { id: '', uri: null, altText: null };

/** Generate 2-character fallback initials from a name. */
export function computeInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '??';
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function mapVisual(ref: AboutVisualRef | null | undefined, withRatio = false): AboutVisual {
  if (!ref) return EMPTY_VISUAL;
  return {
    id: ref.file.id,
    uri: ref.file.url,
    altText: ref.alt ?? null,
    ...(withRatio ? { aspectRatio: ref.aspectRatio ?? undefined } : {}),
  };
}

export function readPurpose(space: AboutSpace): Purpose {
  const facet = space.about.facets.find(f => f.namespace === PURPOSE_FACET.namespace && f.name === PURPOSE_FACET.name);
  return (facet?.value ?? {}) as Purpose;
}

export function mapSpaceToAboutFormValues(space: AboutSpace): AboutFormValues {
  const about = space.about;
  const location = (about.location ?? {}) as Location;
  const purpose = readPurpose(space);

  return {
    name: about.displayName ?? '',
    tagline: about.tagline ?? '',
    country: location.country ?? '',
    city: location.city ?? '',
    avatar: mapVisual(about.avatar),
    pageBanner: mapVisual(about.banner, true),
    cardBanner: mapVisual(about.card),
    // Tags are Space.tags and links are owned by the space itself: no tagset or profile wrapper ids.
    tagsetId: '',
    tags: space.tags,
    profileId: space.id,
    references: [...(space.links ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(link => ({
        id: link.id,
        title: link.title ?? '',
        uri: link.uri,
        description: link.description ?? '',
      })),
    what: about.description ?? '',
    why: purpose.why ?? '',
    who: purpose.who ?? '',
  };
}

/**
 * `Space.classifications` → the CRD plain-TS shape. The vocabulary keeps its served (authored) order; cardinality,
 * the shown/hidden flag and the entry order are the instance settings `selection`, `visible` and `order`.
 */
export function mapNativeClassificationEntries(space: AboutSpace): ClassificationEntryData[] {
  return (space.classifications ?? []).map((entry, index) => {
    const settings = (entry.settings ?? {}) as ClassificationSettings;
    return {
      id: entry.id,
      displayLabel: entry.label,
      cardinality: settings.selection === 'one' ? 'SINGLE_SELECT' : 'MULTI_SELECT',
      values: entry.values.map(v => ({ id: v.id, label: v.value })),
      selectedValueIDs: entry.selected.map(v => v.id),
      display: settings.visible ?? true,
      sortOrder: settings.order ?? index,
    };
  });
}

/**
 * The legacy `about.classifications` read of the Space and Subspace About pages (CrdSpaceAbout, CrdSubspaceAbout),
 * which still read SpaceAboutDetails; the settings tab reads `mapNativeClassificationEntries`.
 */
export function mapClassificationEntries(
  space: NonNullable<SpaceAboutDetailsQuery['lookup']['space']>
): ClassificationEntryData[] {
  return (space.about.classifications ?? []).map(entry => ({
    id: entry.id,
    displayLabel: entry.displayLabel,
    cardinality: mapGqlClassificationCardinality(entry.cardinality),
    values: entry.values.map(v => ({ id: v.id, label: v.label })),
    selectedValueIDs: entry.selectedValueIDs,
    display: entry.display,
    sortOrder: entry.sortOrder,
  }));
}

/** Build the live Preview card view from current form values + space id. */
export function buildPreviewCard(
  spaceId: string,
  values: AboutFormValues,
  href: string,
  level: SpaceSettingsLevel
): SpaceCardPreview {
  return {
    name: values.name,
    tagline: values.tagline,
    // The Preview is a SpaceCard (Explore-card shape), so its banner is the
    // card banner — not the page banner. L0 spaces have both, but the Explore
    // card uses cardBanner regardless. L1/L2 subspaces have no page banner.
    bannerUrl: values.cardBanner.uri ?? null,
    avatarUrl: values.avatar.uri ?? null,
    tags: values.tags,
    color: pickColorFromId(spaceId),
    initials: computeInitials(values.name),
    href,
    level,
    what: values.what,
  };
}
