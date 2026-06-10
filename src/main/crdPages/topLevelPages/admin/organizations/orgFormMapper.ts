import type { CreateOrganizationInput, UpdateOrganizationInput } from '@/core/apollo/generated/graphql-schema';
import type { OrgFormValues } from '@/crd/components/admin/organizations/OrganizationForm';

export const EMPTY_ORG_FORM: OrgFormValues = {
  nameID: '',
  displayName: '',
  contactEmail: '',
  domain: '',
  legalEntityName: '',
  website: '',
  tagline: '',
  description: '',
  city: '',
  country: '',
  references: [],
};

/** Minimal shape read from `useOrganizationProfileInfoQuery` (`lookup.organization`). */
export type OrgProfileInfoData = {
  nameID: string;
  contactEmail?: string;
  domain?: string;
  legalEntityName?: string;
  website?: string;
  profile?: {
    displayName: string;
    description?: string;
    tagline?: string;
    location?: { city?: string; country?: string };
    references?: { id: string; name: string; uri: string; description?: string }[];
  };
};

export const mapOrgToFormValues = (org: OrgProfileInfoData): OrgFormValues => ({
  nameID: org.nameID ?? '',
  displayName: org.profile?.displayName ?? '',
  contactEmail: org.contactEmail ?? '',
  domain: org.domain ?? '',
  legalEntityName: org.legalEntityName ?? '',
  website: org.website ?? '',
  tagline: org.profile?.tagline ?? '',
  description: org.profile?.description ?? '',
  city: org.profile?.location?.city ?? '',
  country: org.profile?.location?.country ?? '',
  references: (org.profile?.references ?? []).map(reference => ({
    id: reference.id,
    name: reference.name,
    uri: reference.uri,
    description: reference.description ?? '',
  })),
});

const trimmedOrUndefined = (value: string): string | undefined => value.trim() || undefined;

const referencesWithContent = (values: OrgFormValues) =>
  values.references.filter(reference => reference.name.trim() || reference.uri.trim());

export const toCreateInput = (values: OrgFormValues): CreateOrganizationInput => ({
  nameID: trimmedOrUndefined(values.nameID),
  contactEmail: trimmedOrUndefined(values.contactEmail),
  domain: trimmedOrUndefined(values.domain),
  legalEntityName: trimmedOrUndefined(values.legalEntityName),
  website: trimmedOrUndefined(values.website),
  profileData: {
    displayName: values.displayName.trim(),
    // Send the raw value (incl. empty string) so clearing the description persists.
    description: values.description,
    tagline: trimmedOrUndefined(values.tagline),
    referencesData: referencesWithContent(values).map(reference => ({
      name: reference.name,
      uri: reference.uri,
      description: reference.description,
    })),
  },
});

export const toUpdateInput = (orgId: string, values: OrgFormValues): UpdateOrganizationInput => ({
  ID: orgId,
  nameID: trimmedOrUndefined(values.nameID),
  contactEmail: trimmedOrUndefined(values.contactEmail),
  domain: trimmedOrUndefined(values.domain),
  legalEntityName: trimmedOrUndefined(values.legalEntityName),
  website: trimmedOrUndefined(values.website),
  profileData: {
    displayName: values.displayName.trim(),
    // Send the raw value (incl. empty string) so clearing the description persists.
    description: values.description,
    tagline: trimmedOrUndefined(values.tagline),
    location: { city: trimmedOrUndefined(values.city), country: values.country || undefined },
    // Only existing references (with an id) can be updated; new rows added during
    // edit are not persisted by the update mutation (parity with MUI's update path).
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
