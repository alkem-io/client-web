import { AuthorizationPrivilege, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { AdminTableRow } from '@/crd/components/admin/AdminSearchableTable';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

export type AdminSpaceRow = AdminTableRow & {
  /** Actual visibility enum value — drives the column chip and the settings dialog. */
  visibility: SpaceVisibility;
  /** The space alias (nameID), editable via the space-settings dialog. */
  nameId: string;
  accountOwner: string;
  /** May the viewer edit the alias/visibility settings? (AccountLicenseManage, client-8) */
  canEditPlatformSettings: boolean;
  /** May the viewer delete this space? (Delete, or PlatformContentFullAccess) */
  canDelete: boolean;
};

type SpaceListItem = {
  id: string;
  nameID: string;
  visibility: SpaceVisibility;
  about: {
    profile: { displayName: string; url: string };
    provider?: { profile?: { displayName: string } } | null;
  };
  authorization?: { myPrivileges?: AuthorizationPrivilege[] | null } | null;
};

/**
 * Maps a platform-admin space to the CRD table row. Non-active spaces get the
 * `[VISIBILITY]` suffix on the name, mirroring MUI's `SpaceList`. `privacyMode`
 * is intentionally not surfaced — the server does not yet expose it to admin
 * (MUI hardcodes it `undefined`; server#5565).
 *
 * Row actions are gated on the viewer's own privileges on this space
 * (client-8), not on admin-area access — the settings edit was previously
 * hardcoded available to everyone who could reach the list.
 */
export const mapSpaceToRow = (space: SpaceListItem): AdminSpaceRow => {
  const isActive = space.visibility === SpaceVisibility.Active;
  const privileges = space.authorization?.myPrivileges ?? [];
  return {
    id: space.id,
    name: isActive
      ? space.about.profile.displayName
      : `${space.about.profile.displayName} [${space.visibility.toUpperCase()}]`,
    url: buildSettingsUrl(space.about.profile.url),
    visibility: space.visibility,
    nameId: space.nameID,
    accountOwner: space.about.provider?.profile?.displayName || 'N/A',
    canEditPlatformSettings: privileges.includes(AuthorizationPrivilege.AccountLicenseManage),
    canDelete:
      privileges.includes(AuthorizationPrivilege.Delete) ||
      privileges.includes(AuthorizationPrivilege.PlatformContentFullAccess),
  };
};
