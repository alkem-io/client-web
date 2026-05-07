import type { UserQuery } from '@/core/apollo/generated/graphql-schema';
import type {
  UserProfileFormValues,
  UserProfileReference,
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
  const defaultTagset = tagsets.find(t => (t.name ?? '').toLowerCase() === 'default') ?? tagsets[0] ?? null;

  return {
    profileId: profile?.id ?? '',
    tagsetId: defaultTagset?.id ?? null,
    displayName: profile?.displayName ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    tagline: profile?.tagline ?? '',
    city: profile?.location?.city ?? '',
    country: profile?.location?.country ?? '',
    bio: profile?.description ?? '',
    tags: defaultTagset?.tags ?? [],
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
