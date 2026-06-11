import type { UpdateUserInput } from '@/core/apollo/generated/graphql-schema';
import type { UserFormValues } from '@/crd/components/admin/users/UserEditForm';

export const EMPTY_USER_FORM: UserFormValues = {
  firstName: '',
  lastName: '',
  displayName: '',
  email: '',
  phone: '',
  tagline: '',
  bio: '',
  city: '',
  country: '',
  references: [],
};

/** Minimal shape read from `useUserQuery` (`lookup.user`). */
export type UserDetailData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profile?: {
    displayName: string;
    tagline?: string;
    description?: string;
    location?: { city?: string; country?: string };
    references?: { id: string; name: string; uri: string; description?: string }[];
  };
};

export const mapUserToFormValues = (user: UserDetailData): UserFormValues => ({
  firstName: user.firstName ?? '',
  lastName: user.lastName ?? '',
  displayName: user.profile?.displayName ?? '',
  email: user.email ?? '',
  phone: user.phone ?? '',
  tagline: user.profile?.tagline ?? '',
  bio: user.profile?.description ?? '',
  city: user.profile?.location?.city ?? '',
  country: user.profile?.location?.country ?? '',
  references: (user.profile?.references ?? []).map(reference => ({
    id: reference.id,
    name: reference.name,
    uri: reference.uri,
    description: reference.description ?? '',
  })),
});

const trimmedOrUndefined = (value: string): string | undefined => value.trim() || undefined;

export const toUpdateUserInput = (userId: string, values: UserFormValues): UpdateUserInput => ({
  ID: userId,
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  phone: trimmedOrUndefined(values.phone),
  profileData: {
    displayName: values.displayName.trim(),
    // Send the raw value (incl. empty string) so clearing the bio persists.
    description: values.bio,
    tagline: trimmedOrUndefined(values.tagline),
    location: { city: trimmedOrUndefined(values.city), country: values.country || undefined },
    // Only existing references (with an id) can be updated (parity with MUI).
    references: values.references
      .filter((reference): reference is typeof reference & { id: string } => Boolean(reference.id))
      .map(reference => ({
        ID: reference.id,
        name: reference.name,
        uri: reference.uri,
        description: reference.description,
      })),
  },
});
