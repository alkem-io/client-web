import type { AdminInnovationPackQuery, UpdateInnovationPackInput } from '@/core/apollo/generated/graphql-schema';
import { SearchVisibility as GqlSearchVisibility } from '@/core/apollo/generated/graphql-schema';
import type { InnovationPackFormValues, SearchVisibilityValue } from '@/crd/components/innovationPack/types';

type GqlAdminInnovationPack = NonNullable<AdminInnovationPackQuery['lookup']['innovationPack']>;

/** Minimal view of an Innovation Pack for the CRD admin page chrome (page title, templates set id). */
export type InnovationPackBasics = {
  id: string;
  templatesSetId: string | undefined;
  displayName: string;
  description: string;
  avatarUrl: string | undefined;
  tags: string[];
  /** The pack's public-profile URL (`<url>/settings` is this admin page). */
  url: string;
};

export function mapInnovationPackToBasics(pack: GqlAdminInnovationPack): InnovationPackBasics {
  const { profile } = pack;
  return {
    id: pack.id,
    templatesSetId: pack.templatesSet?.id,
    displayName: profile.displayName,
    description: profile.description ?? '',
    avatarUrl: profile.avatar?.uri || undefined,
    tags: profile.tagset?.tags ?? [],
    url: profile.url,
  };
}

// ---------------------------------------------------------------------------
// Extended detail for the US7 admin-form path (profile ids, mutation-input
// builders). The legacy form has the provider as a disabled `TextField` —
// the CRD form mirrors that (no org picker), so the provider name is read
// from `pack.provider.profile.displayName` and threaded to the view as
// `providerName` (the form itself has no provider field).
// ---------------------------------------------------------------------------

/** Identifiers + raw shapes that the integration hook needs to drive the form. */
export type InnovationPackDetail = {
  id: string;
  profileId: string;
  templatesSetId: string | undefined;
  tagsetId: string | undefined;
  avatarVisualId: string | undefined;
  url: string;
  providerName: string;
  formValues: InnovationPackFormValues;
};

const searchVisibilityFromGql = (v: GqlSearchVisibility): SearchVisibilityValue => {
  switch (v) {
    case GqlSearchVisibility.Public:
      return 'public';
    case GqlSearchVisibility.Account:
      return 'authenticated';
    case GqlSearchVisibility.Hidden:
      return 'account';
  }
};

export const searchVisibilityToGql = (v: SearchVisibilityValue): GqlSearchVisibility => {
  switch (v) {
    case 'public':
      return GqlSearchVisibility.Public;
    case 'authenticated':
      return GqlSearchVisibility.Account;
    case 'account':
      return GqlSearchVisibility.Hidden;
  }
};

export function mapInnovationPackToDetail(pack: GqlAdminInnovationPack): InnovationPackDetail {
  const { profile } = pack;
  const formValues: InnovationPackFormValues = {
    name: profile.displayName,
    description: profile.description ?? '',
    tags: profile.tagset?.tags ?? [],
    avatarFile: undefined,
    references: (profile.references ?? []).map(ref => ({
      id: ref.id,
      name: ref.name,
      uri: ref.uri,
      description: ref.description ?? '',
    })),
    listedInStore: pack.listedInStore ?? false,
    searchVisibility: searchVisibilityFromGql(pack.searchVisibility),
  };
  return {
    id: pack.id,
    profileId: profile.id,
    templatesSetId: pack.templatesSet?.id,
    tagsetId: profile.tagset?.id,
    avatarVisualId: profile.avatar?.id,
    url: profile.url,
    providerName: pack.provider?.profile?.displayName ?? '',
    formValues,
  };
}

/**
 * Build the `updateInnovationPack` mutation input from form values **excluding**
 * the reference list (new/removed references are handled by separate mutations
 * because `UpdateReferenceInput` requires an `ID` — same approach as the About
 * tab — see `useAboutTabData`). Existing references with an `id` are still
 * passed through so name/uri/description edits are persisted in the same call.
 */
export function formValuesToUpdateInnovationPackInput(
  detail: InnovationPackDetail,
  values: InnovationPackFormValues
): UpdateInnovationPackInput {
  return {
    ID: detail.id,
    listedInStore: values.listedInStore,
    searchVisibility: searchVisibilityToGql(values.searchVisibility),
    profileData: {
      displayName: values.name,
      description: values.description,
      ...(detail.tagsetId ? { tagsets: [{ ID: detail.tagsetId, tags: values.tags }] } : {}),
      references: values.references
        .filter(r => Boolean(r.id))
        .map(r => ({ ID: r.id ?? '', name: r.name, uri: r.uri, description: r.description ?? '' })),
    },
  };
}
