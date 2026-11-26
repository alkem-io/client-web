import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { SpaceDocumentFragment } from '@/core/apollo/generated-v2/graphql-schema';
import {
  type ClassificationEntryData,
  groupEntriesForDisplay,
  resolveSelectedValues,
} from '@/crd/components/classification/types';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';
import { getInitials } from '@/crd/lib/getInitials';
import { type AboutFacet, facetClassifications, facetLinks, facetPurpose } from '@/domain/space/about/aboutFacets';

export { getInitials };

export type SpaceVisibilityData = {
  status: 'active' | 'archived' | 'demo' | 'inactive';
  contactHref?: string;
};

export function mapSpaceVisibility(visibility: SpaceVisibility | undefined): SpaceVisibilityData {
  switch (visibility) {
    case SpaceVisibility.Archived:
      return { status: 'archived' };
    case SpaceVisibility.Demo:
      return { status: 'demo' };
    case SpaceVisibility.Inactive:
      return { status: 'inactive' };
    default:
      return { status: 'active' };
  }
}

type LeadContributorLike = {
  id: string;
  profile?: {
    displayName?: string | null;
    avatar?: { uri?: string | null } | null;
    url?: string | null;
    location?: { city?: string | null; country?: string | null } | null;
  } | null;
};

function mapLeadContributor(contributor: LeadContributorLike, type: 'person' | 'org'): LeadItem | undefined {
  if (!contributor.profile) return undefined;
  const name = contributor.profile.displayName ?? '';
  const cityCountry = [contributor.profile.location?.city, contributor.profile.location?.country]
    .filter(Boolean)
    .join(', ');
  return {
    id: contributor.id,
    name,
    avatarUrl: contributor.profile.avatar?.uri ?? undefined,
    initials: getInitials(name) || '??',
    location: cityCountry || undefined,
    href: contributor.profile.url ?? undefined,
    type,
  };
}

export function mapSidebarLeads(
  leadUsers: LeadContributorLike[] | undefined,
  leadOrganizations?: LeadContributorLike[] | undefined
): LeadItem[] {
  const users = (leadUsers ?? [])
    .map(u => mapLeadContributor(u, 'person'))
    .filter((l): l is LeadItem => l !== undefined);
  const orgs = (leadOrganizations ?? [])
    .map(o => mapLeadContributor(o, 'org'))
    .filter((l): l is LeadItem => l !== undefined);
  return [...users, ...orgs];
}

type NativeLocation = { city?: string | null; country?: string | null } | null | undefined;

type NativeActorFace = {
  id: string;
  actorType: string;
  url?: string | null;
  about?: { displayName: string; avatar?: { file: { url: string } } | null; location?: unknown } | null;
};

/** A native actor face in the legacy contributor-profile shape the existing mappers read. */
export const actorProfile = (actor: NativeActorFace) => ({
  id: actor.id,
  profile: actor.about
    ? {
        displayName: actor.about.displayName,
        url: actor.url ?? '',
        avatar: actor.about.avatar ? { uri: actor.about.avatar.file.url } : undefined,
        location: actor.about.location as NativeLocation,
      }
    : undefined,
});

/** The actors of one actorType (legacy kept users and organizations in separate lists). */
export const actorsOfType = (actors: readonly NativeActorFace[] | null | undefined, actorType: string) =>
  (actors ?? []).filter(actor => actor.actorType === actorType).map(actorProfile);

/** Space.guidelines is the core.guidelines section JSON; it carries the title and text of legacy's guidelines profile. */
export const nativeGuidelines = (space: { guidelines?: unknown } | undefined) =>
  space?.guidelines as { displayName?: string; description?: string } | null | undefined;

type SpaceLeadType = SpaceAboutData['leadUsers'][number]['type'];

const cityCountry = (location: NativeLocation) =>
  [location?.city, location?.country].filter(Boolean).join(', ') || undefined;

const aboutLead = (profile: NonNullable<ReturnType<typeof actorProfile>['profile']>, type: SpaceLeadType) => ({
  name: profile.displayName,
  avatarUrl: profile.avatar?.uri,
  type,
  location: cityCountry(profile.location),
  href: profile.url,
});

const aboutLeads = (actors: NativeActorFace[] | null | undefined, actorType: string, type: SpaceLeadType) =>
  actorsOfType(actors, actorType).flatMap(({ profile }) => (profile ? [aboutLead(profile, type)] : []));

type FacetedAbout = { about: { facets: readonly AboutFacet[] } };

/** The About's why/who: the core.purpose facet (A4.1; H-about-meta-8), absent when the space holds none. */
export const nativePurpose = (space: FacetedAbout | undefined) => facetPurpose(space?.about.facets);

/** The space's references: its link roles' links in their order (legacy profile.references; aboutFacets). */
export const nativeReferences = (space: FacetedAbout | undefined) =>
  facetLinks(space?.about.facets).map(link => ({
    name: link.title ?? '',
    uri: link.uri,
    description: link.description ?? undefined,
  }));

/**
 * The space's classification groups for the About (A4.2; FR-018/D2): the instance settings carry the shown/hidden flag
 * (`visible`) and the entry order (`order`); an editor also sees hidden and empty groups, a reader neither (legacy
 * groupEntriesForDisplay).
 */
export const nativeClassifications = (space: FacetedAbout | undefined, canEdit: boolean, unservedLabel: string) => {
  // The set's instance settings carry its display label, shown/hidden flag, order and cardinality (A4.2); a set whose
  // settings the server does not serve yet says so in its label slot (unservedLabel) and takes the defaults.
  const entries: ClassificationEntryData[] = facetClassifications(space?.about.facets).map((entry, index) => {
    const settings = entry.choiceSet.settings;
    return {
      id: entry.choiceSet.id,
      displayLabel: settings ? (settings.display_label ?? '') : unservedLabel,
      cardinality: settings?.selection === 'one' ? 'SINGLE_SELECT' : 'MULTI_SELECT',
      values: [...entry.choiceSet.values]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(value => ({ id: value.id, label: value.value })),
      selectedValueIDs: entry.selected ?? [],
      display: settings?.visible ?? true,
      sortOrder: settings?.order ?? index,
    };
  });
  return groupEntriesForDisplay(entries, { canEdit }).map(entry => ({
    id: entry.id,
    displayLabel: entry.displayLabel,
    values: resolveSelectedValues(entry).map(value => value.label),
    hidden: !entry.display,
  }));
};

/**
 * The About props from the D2 Space document (021 F054-F068), the model's fields as legacy renders them: why/who,
 * references and classifications from the About's facets (aboutFacets), the host's and leads' faces; a field the space
 * holds no value for comes back null and renders as legacy renders absent data.
 */
export const mapNativeSpaceAbout = (
  space: SpaceDocumentFragment | undefined,
  unservedLabel: string
): SpaceAboutData => {
  const host = space?.host && actorProfile(space.host).profile;
  const purpose = nativePurpose(space);
  return {
    name: space?.about.displayName ?? '',
    tagline: space?.about.tagline ?? undefined,
    description: space?.about.description ?? undefined,
    location: cityCountry(space?.about.location as NativeLocation),
    metrics: space?.memberCount == null ? [] : [{ name: 'members', value: String(space.memberCount) }],
    who: purpose?.who ?? undefined,
    why: purpose?.why ?? undefined,
    provider: host ? aboutLead(host, 'organization') : undefined,
    leadUsers: aboutLeads(space?.leads, 'user', 'person'),
    leadOrganizations: aboutLeads(space?.leads, 'organization', 'organization'),
    references: nativeReferences(space),
    tags: space?.tags ?? [],
    classifications: nativeClassifications(space, space?.can.update ?? false, unservedLabel),
  };
};
