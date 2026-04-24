import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

export type CalloutMenuPermissionsInput = {
  myPrivileges: AuthorizationPrivilege[] | undefined;
  visibility: CalloutVisibility;
  calloutsSetMyPrivileges: AuthorizationPrivilege[] | undefined;
  contributionsEnabled: boolean;
  contributionsCount: number;
  canBeSavedAsTemplate: boolean;
  saveAsTemplateFeatureEnabled: boolean;
  hasMoveNeighbours: boolean;
};

export type CalloutMenuPermissions = {
  editable: boolean;
  isDraft: boolean;
  showEdit: boolean;
  showPublish: boolean;
  showUnpublish: boolean;
  showDelete: boolean;
  showShare: boolean;
  showSortContributions: boolean;
  showSaveAsTemplate: boolean;
  movable: boolean;
};

/**
 * Pure derivation of the 3-dots context-menu visibility matrix (plan T062 /
 * T099). Extracted so T099 can unit-test the permission logic in isolation
 * without rendering the connector.
 *
 * Rules (FR-101):
 * - Edit / Publish / Unpublish / Delete / Save-as-Template require
 *   `AuthorizationPrivilege.Update` on the callout.
 * - Publish shows only when the callout is a draft; Unpublish only when
 *   published.
 * - Sort Contributions requires `Update` on the callout **and** at least two
 *   contributions to reorder **and** contributions enabled on the callout.
 * - Share is always shown.
 * - Save-as-Template additionally requires the local feature flag
 *   `CRD_SAVE_AS_TEMPLATE_ENABLED` (plan D12) and the backend-derived
 *   `canBeSavedAsTemplate` flag.
 * - Move items require `Update` on the calloutsSet (not the callout) **and**
 *   at least one neighbour to move to (hides entirely for single-callout feeds).
 */
export const deriveCalloutMenuVisibility = (input: CalloutMenuPermissionsInput): CalloutMenuPermissions => {
  const editable = input.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const isDraft = input.visibility === CalloutVisibility.Draft;
  const canMoveSet = input.calloutsSetMyPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  return {
    editable,
    isDraft,
    showEdit: editable,
    showPublish: editable && isDraft,
    showUnpublish: editable && !isDraft,
    showDelete: editable,
    showShare: true,
    showSortContributions: editable && input.contributionsEnabled && input.contributionsCount >= 2,
    showSaveAsTemplate: editable && input.canBeSavedAsTemplate && input.saveAsTemplateFeatureEnabled,
    movable: canMoveSet && input.hasMoveNeighbours,
  };
};
