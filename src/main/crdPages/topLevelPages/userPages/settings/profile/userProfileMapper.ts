import { TagsetReservedName, type UserQuery } from '@/core/apollo/generated/graphql-schema';
import type {
  UserProfileFormValues,
  UserProfileReference,
  UserProfileTagset,
} from '@/crd/components/user/settings/UserProfileTabView.types';

export type UserProfileQueryUser = NonNullable<UserQuery['lookup']['user']>;

const RECOGNIZED = ['linkedin', 'bsky', 'github'] as const;

const isRecognized = (name: string): name is (typeof RECOGNIZED)[number] =>
  RECOGNIZED.includes(name.toLowerCase() as (typeof RECOGNIZED)[number]);

const findRecognized = (
  references: ReadonlyArray<UserProfileReference>,
  kind: (typeof RECOGNIZED)[number]
): UserProfileReference | null => references.find(r => r.name.toLowerCase() === kind) ?? null;

const EMPTY_VISUAL = { id: '', uri: null, altText: null } as const;

/**
 * Map the GraphQL `User` payload to the plain CRD form-values shape that
 * `useUserProfileTabData` consumes. This is the only place GraphQL types
 * meet CRD prop types (FR-006).
 */
export const mapUserToProfileFormValues = (user: UserProfileQueryUser): UserProfileFormValues => {
  const profile = user.profile;
  const allReferences: UserProfileReference[] = (profile?.references ?? []).map(ref => ({
    id: ref.id,
    name: ref.name ?? '',
    uri: ref.uri ?? '',
    description: ref.description ?? '',
    recognized: isRecognized(ref.name ?? ''),
  }));

  const arbitraryReferences = allReferences.filter(r => !r.recognized);

  // The recognized rows are always present in the form (even when missing on
  // the server) so the user can fill them in via the dedicated tiles. When
  // missing on the server the row carries an empty id + empty uri.
  const recognizedReferences = {
    linkedin: findRecognized(allReferences, 'linkedin') ?? {
      id: '',
      name: 'linkedin',
      uri: '',
      description: '',
      recognized: true,
    },
    bsky: findRecognized(allReferences, 'bsky') ?? {
      id: '',
      name: 'bsky',
      uri: '',
      description: '',
      recognized: true,
    },
    github: findRecognized(allReferences, 'github') ?? {
      id: '',
      name: 'github',
      uri: '',
      description: '',
      recognized: true,
    },
  };

  const tagsets = profile?.tagsets ?? [];
  const skills = findTagset(tagsets, TagsetReservedName.Skills);
  const keywords = findTagset(tagsets, TagsetReservedName.Keywords);

  return {
    profileId: profile?.id ?? '',
    displayName: profile?.displayName ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    tagline: profile?.tagline ?? '',
    city: profile?.location?.city ?? '',
    country: profile?.location?.country ?? '',
    bio: profile?.description ?? '',
    skills,
    keywords,
    avatar: profile?.avatar
      ? {
          id: profile.avatar.id,
          uri: profile.avatar.uri ?? null,
          altText: profile.avatar.alternativeText ?? null,
        }
      : { ...EMPTY_VISUAL },
    references: arbitraryReferences,
    recognizedReferences,
  };
};

/**
 * Look up a profile tagset by reserved name, case-insensitively (parity with
 * `UserProfileView.tsx` and `useOrganization.ts`). When the tagset doesn't
 * yet exist on the profile, returns `{ id: undefined, tags: [] }` — the
 * per-tab hook lazy-creates it on the section's first Save.
 */
const findTagset = (
  tagsets: ReadonlyArray<{ id: string; name: string; tags: string[] }>,
  reservedName: TagsetReservedName
): UserProfileTagset => {
  const found = tagsets.find(t => (t.name ?? '').toLowerCase() === reservedName.toLowerCase());
  return found ? { id: found.id, tags: found.tags } : { id: undefined, tags: [] };
};

/** Phone-format validator. Mirrors the existing MUI `UserForm` regex. */
export const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

/** Loose URL validator — accepts blank (optional refs) or a parseable URL. */
export const isValidUrlOrEmpty = (value: string): boolean => {
  if (!value) return true;
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
};
