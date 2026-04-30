import type { SpaceAboutDetailsQuery } from '@/core/apollo/generated/graphql-schema';
import type {
  AboutFormValues,
  AboutReference,
  AboutVisual,
  SpaceCardPreview,
} from '@/crd/components/space/settings/SpaceSettingsAboutView.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export type { AboutFormValues, AboutReference, AboutVisual, SpaceCardPreview };

/** The subset of the SpaceAboutDetailsQuery the mapper consumes. */
export type AboutSpace = NonNullable<SpaceAboutDetailsQuery['lookup']['space']>;

/** Empty visual used when the backend returns no avatar / banner / cardBanner. */
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

export function mapSpaceToAboutFormValues(space: AboutSpace): AboutFormValues {
  const profile = space.about.profile;
  const tagset = profile.tagset;

  return {
    name: profile.displayName ?? '',
    tagline: profile.tagline ?? '',
    country: profile.location?.country ?? '',
    city: profile.location?.city ?? '',
    avatar: profile.avatar
      ? { id: profile.avatar.id, uri: profile.avatar.uri ?? null, altText: profile.avatar.alternativeText ?? null }
      : EMPTY_VISUAL,
    pageBanner: profile.banner
      ? { id: profile.banner.id, uri: profile.banner.uri ?? null, altText: profile.banner.alternativeText ?? null }
      : EMPTY_VISUAL,
    cardBanner: profile.cardBanner
      ? {
          id: profile.cardBanner.id,
          uri: profile.cardBanner.uri ?? null,
          altText: profile.cardBanner.alternativeText ?? null,
        }
      : EMPTY_VISUAL,
    tagsetId: tagset?.id ?? '',
    tags: tagset?.tags ?? [],
    profileId: profile.id,
    references:
      profile.references?.map(reference => ({
        id: reference.id,
        title: reference.name ?? '',
        uri: reference.uri ?? '',
        description: reference.description ?? '',
      })) ?? [],
    what: profile.description ?? '',
    why: space.about.why ?? '',
    who: space.about.who ?? '',
  };
}

/** Build the live Preview card view from current form values + space id. */
export function buildPreviewCard(spaceId: string, values: AboutFormValues, href: string): SpaceCardPreview {
  return {
    name: values.name,
    tagline: values.tagline,
    // The Preview is a SpaceCard (Explore-card shape), so its banner is the
    // card banner — not the page banner. Subspaces never have a page banner;
    // L0 spaces have both, but the Explore card uses cardBanner regardless.
    bannerUrl: values.cardBanner.uri ?? null,
    avatarUrl: values.avatar.uri ?? null,
    tags: values.tags,
    color: pickColorFromId(spaceId),
    initials: computeInitials(values.name),
    href,
    what: values.what,
  };
}
