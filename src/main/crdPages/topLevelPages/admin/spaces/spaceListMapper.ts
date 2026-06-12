import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { AdminTableRow } from '@/crd/components/admin/AdminSearchableTable';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

export type AdminSpaceRow = AdminTableRow & {
  /** Actual visibility enum value — drives the column chip and the settings dialog. */
  visibility: SpaceVisibility;
  /** The space alias (nameID), editable via the space-settings dialog. */
  nameId: string;
  accountOwner: string;
  /** Gates the delete + settings actions (parity with MUI `SpaceTableItem.canUpdate`). */
  canUpdate: boolean;
};

type SpaceListItem = {
  id: string;
  nameID: string;
  visibility: SpaceVisibility;
  about: {
    profile: { displayName: string; url: string };
    provider?: { profile?: { displayName: string } } | null;
  };
};

/**
 * Maps a platform-admin space to the CRD table row. Non-active spaces get the
 * `[VISIBILITY]` suffix on the name, mirroring MUI's `SpaceList`. `privacyMode`
 * is intentionally not surfaced — the server does not yet expose it to admin
 * (MUI hardcodes it `undefined`; server#5565).
 */
export const mapSpaceToRow = (space: SpaceListItem): AdminSpaceRow => {
  const isActive = space.visibility === SpaceVisibility.Active;
  return {
    id: space.id,
    name: isActive
      ? space.about.profile.displayName
      : `${space.about.profile.displayName} [${space.visibility.toUpperCase()}]`,
    url: buildSettingsUrl(space.about.profile.url),
    visibility: space.visibility,
    nameId: space.nameID,
    accountOwner: space.about.provider?.profile?.displayName || 'N/A',
    canUpdate: true,
  };
};
