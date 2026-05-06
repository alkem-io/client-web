/**
 * Org Authorization tab — view contracts.
 * Two sub-tabs (Admin / Owner) each rendering a RoleAssignmentView.
 * See data-model.md "User Story 11" for details.
 */

import type { RoleAssignmentViewProps } from './tab-orgCommunity';

export type AuthorizationSubTab = 'admin' | 'owner';

export type OrgAuthorizationViewProps = {
  /** Active sub-tab; held in local React state by the integration page (no URL sync). */
  activeSubTab: AuthorizationSubTab;
  onSubTabChange: (next: AuthorizationSubTab) => void;
  adminLabel: string; // i18n: "Admin"
  ownerLabel: string; // i18n: "Owner"
  /** Body of the active sub-tab — the integration page passes the matching `RoleAssignmentViewProps`. */
  admin: RoleAssignmentViewProps;
  owner: RoleAssignmentViewProps;
};
