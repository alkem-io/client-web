import { type InnovationHubSpaceFragment, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

export type SpaceVisibilityVariant = 'active' | 'demo' | 'inactive' | 'archived' | 'unknown';

/**
 * Pure data shape for the Spaces tab table. The visibility *variant* is data
 * (drives badge styling). The visibility *label* is presentation and lives on
 * `HubSpacesTableRow` only after the hook resolves it via typed `t()` calls —
 * see `useHubSpacesTabData`. Keeping label-resolution out of the mapper means
 * the mapper has one job (GraphQL → plain TS) and is testable without an
 * i18n stub.
 */
export type HubSpacesTableRowData = {
  id: string;
  name: string;
  visibility: SpaceVisibilityVariant;
  hostAccount: string;
  spaceUrl: string;
};

export type HubSpacesTableRow = HubSpacesTableRowData & { visibilityLabel: string };

export const normalizeSpaceVisibility = (value: SpaceVisibility | undefined | null): SpaceVisibilityVariant => {
  switch (value) {
    case SpaceVisibility.Active:
      return 'active';
    case SpaceVisibility.Demo:
      return 'demo';
    case SpaceVisibility.Inactive:
      return 'inactive';
    case SpaceVisibility.Archived:
      return 'archived';
    default:
      return 'unknown';
  }
};

export const mapInnovationHubSpaceToTableRow = (space: InnovationHubSpaceFragment): HubSpacesTableRowData => ({
  id: space.id,
  name: space.about.profile.displayName,
  visibility: normalizeSpaceVisibility(space.visibility),
  hostAccount: space.about.provider?.profile?.displayName ?? '—',
  spaceUrl: space.about.profile.url,
});
