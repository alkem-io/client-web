import {
  type OrganizationProfileInfoQuery,
  OrganizationVerificationEnum,
  TagsetReservedName,
} from '@/core/apollo/generated/graphql-schema';
import type { OrgVerificationStatus } from '@/crd/components/contributor/settings/OrgVerifiedBadge';

export type OrgProfileSectionKey =
  | 'displayName'
  | 'tagline'
  | 'description'
  | 'location'
  | 'keywords'
  | 'capabilities'
  | 'contactEmail'
  | 'domain'
  | 'legalEntityName'
  | 'website'
  | 'references';

export type OrgProfileVisual = {
  id: string;
  uri: string | null;
  altText: string | null;
};

export type OrgProfileReference = {
  id: string;
  name: string;
  uri: string;
  description: string;
  recognized: boolean;
};

export type OrgProfileTagset = {
  id?: string;
  tags: string[];
};

export type OrgProfileFormValues = {
  /** GraphQL profile id — used by reference / tagset create mutations. */
  profileId: string;
  /** Read-only org id. */
  organizationId: string;
  /** Read-only nameID — set at creation, can't be changed. */
  nameID: string;
  displayName: string;
  tagline: string;
  description: string;
  city: string;
  /** ISO code, never the localized country name. */
  country: string;
  /** `Keywords` profile tagset (case-insensitive lookup). */
  keywords: OrgProfileTagset;
  /** `Capabilities` profile tagset (case-insensitive lookup). */
  capabilities: OrgProfileTagset;
  contactEmail: string;
  domain: string;
  legalEntityName: string;
  website: string;
  /** Avatar / logo visual (immediate-commit on upload per FR-093). */
  avatar: OrgProfileVisual;
  /** Arbitrary references (non-recognized social tiles). */
  references: OrgProfileReference[];
  /** Recognized social tiles (LinkedIn / Bluesky / GitHub) — always present, may have empty id+uri when not yet set. */
  recognizedReferences: {
    linkedin: OrgProfileReference | null;
    bsky: OrgProfileReference | null;
    github: OrgProfileReference | null;
  };
  /** Read-only — `OrganizationVerifiedBadge` (FR-094). */
  verifiedStatus: OrgVerificationStatus;
};

export type OrgProfileQueryOrganization = NonNullable<OrganizationProfileInfoQuery['lookup']['organization']>;

const RECOGNIZED = ['linkedin', 'bsky', 'github'] as const;

const isRecognized = (name: string): name is (typeof RECOGNIZED)[number] =>
  RECOGNIZED.includes(name.toLowerCase() as (typeof RECOGNIZED)[number]);

const findRecognized = (
  references: ReadonlyArray<OrgProfileReference>,
  kind: (typeof RECOGNIZED)[number]
): OrgProfileReference | null => references.find(r => r.name.toLowerCase() === kind) ?? null;

const EMPTY_VISUAL = { id: '', uri: null, altText: null } as const;

const findTagset = (
  tagsets: ReadonlyArray<{ id: string; name: string; tags: string[] }>,
  reservedName: TagsetReservedName
): OrgProfileTagset => {
  const found = tagsets.find(t => (t.name ?? '').toLowerCase() === reservedName.toLowerCase());
  return found ? { id: found.id, tags: found.tags } : { id: undefined, tags: [] };
};

/**
 * Resolve the `OrgVerifiedBadge` status from the GraphQL enum (Decision
 * #12). The schema currently exposes only two values
 * (`VerifiedManualAttestation` / `NotVerified`); the badge component
 * carries a third `pending` state for future-proofing but the mapper
 * never produces it today.
 */
const resolveVerificationStatus = (status: OrganizationVerificationEnum): OrgVerificationStatus => {
  if (status === OrganizationVerificationEnum.VerifiedManualAttestation) return 'verified';
  return 'notVerified';
};

/**
 * Pure mapper from `OrganizationProfileInfoQuery` data to the plain CRD
 * form-values shape that `useOrgProfileTabData` consumes — only place
 * GraphQL types meet CRD prop types per FR-006. Mirrors
 * `mapUserToProfileFormValues` (User Profile) plus the org-specific
 * Identity / Contact & Legal / Verification fields.
 */
export const mapOrganizationToProfileFormValues = (org: OrgProfileQueryOrganization): OrgProfileFormValues => {
  const profile = org.profile;
  const allReferences: OrgProfileReference[] = (profile?.references ?? []).map(ref => ({
    id: ref.id,
    name: ref.name ?? '',
    uri: ref.uri ?? '',
    description: ref.description ?? '',
    recognized: isRecognized(ref.name ?? ''),
  }));

  const arbitraryReferences = allReferences.filter(r => !r.recognized);

  const recognizedReferences = {
    linkedin:
      findRecognized(allReferences, 'linkedin') ??
      ({ id: '', name: 'linkedin', uri: '', description: '', recognized: true } as OrgProfileReference),
    bsky:
      findRecognized(allReferences, 'bsky') ??
      ({ id: '', name: 'bsky', uri: '', description: '', recognized: true } as OrgProfileReference),
    github:
      findRecognized(allReferences, 'github') ??
      ({ id: '', name: 'github', uri: '', description: '', recognized: true } as OrgProfileReference),
  };

  const tagsets = profile?.tagsets ?? [];
  const keywords = findTagset(tagsets, TagsetReservedName.Keywords);
  const capabilities = findTagset(tagsets, TagsetReservedName.Capabilities);

  // The avatar visual is the first `Avatar`-type entry in `profile.visuals`.
  // (Org profiles use the `Avatar` visual as their logo — there's no
  // dedicated `avatar` field on the Profile type, only a typed `visuals[]`.)
  const avatarVisual = (profile?.visuals ?? []).find(v => v.name === 'AVATAR');

  return {
    profileId: profile?.id ?? '',
    organizationId: org.id,
    nameID: org.nameID,
    displayName: profile?.displayName ?? '',
    tagline: profile?.tagline ?? '',
    description: profile?.description ?? '',
    city: profile?.location?.city ?? '',
    country: profile?.location?.country ?? '',
    keywords,
    capabilities,
    contactEmail: org.contactEmail ?? '',
    domain: org.domain ?? '',
    legalEntityName: org.legalEntityName ?? '',
    website: org.website ?? '',
    avatar: avatarVisual
      ? {
          id: avatarVisual.id,
          uri: avatarVisual.uri ?? null,
          altText: avatarVisual.alternativeText ?? null,
        }
      : { ...EMPTY_VISUAL },
    references: arbitraryReferences,
    recognizedReferences,
    verifiedStatus: resolveVerificationStatus(org.verification.status),
  };
};

/** Email format validator — matches the existing MUI form. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** URL validator — same shape as the User Profile mapper. */
export const isValidUrlOrEmpty = (value: string): boolean => {
  if (!value) return true;
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
};
