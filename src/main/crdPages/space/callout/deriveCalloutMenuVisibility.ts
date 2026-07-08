import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';

export type CalloutMenuPermissionsInput = {
  myPrivileges: AuthorizationPrivilege[] | undefined;
  visibility: CalloutVisibility;
  /**
   * Whether the current user can reorder callouts within the parent set.
   * The set-level `Update` privilege is not part of `callout.authorization`,
   * so the consumer (the parent list connector) is the authoritative source —
   * typically expressed as `Boolean(moveActions)`.
   */
  canMoveSet: boolean;
  contributionsEnabled: boolean;
  contributionsCount: number;
  canBeSavedAsTemplate: boolean;
  saveAsTemplateFeatureEnabled: boolean;
  /**
   * True when the callout's framing is a Collabora document. Saving a document
   * callout as a template is not yet supported, so the menu item is shown but
   * disabled (greyed out) rather than hidden — see `saveAsTemplateDisabled`.
   */
  isCollaboraDocument: boolean;
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
  /**
   * When `showSaveAsTemplate` is true, this marks the item as greyed-out /
   * non-actionable. Set for document callouts, where save-as-template is not
   * yet supported.
   */
  saveAsTemplateDisabled: boolean;
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
 *   `canBeSavedAsTemplate` flag. Document (Collabora) callouts are an
 *   exception: the item is still shown but greyed out
 *   (`saveAsTemplateDisabled`) because saving them as templates is not yet
 *   supported.
 * - Move items require `Update` on the calloutsSet (not the callout) **and**
 *   at least one neighbour to move to (hides entirely for single-callout feeds).
 */
export const deriveCalloutMenuVisibility = (input: CalloutMenuPermissionsInput): CalloutMenuPermissions => {
  const editable = input.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const isDraft = input.visibility === CalloutVisibility.Draft;

  return {
    editable,
    isDraft,
    showEdit: editable,
    showPublish: editable && isDraft,
    showUnpublish: editable && !isDraft,
    showDelete: editable,
    showShare: true,
    showSortContributions: editable && input.contributionsEnabled && input.contributionsCount >= 2,
    // Documents show the item greyed out (`saveAsTemplateDisabled`) even though
    // the backend `canBeSavedAsTemplate` flag may not cover them, so the
    // affordance stays visible as "not yet supported".
    showSaveAsTemplate:
      editable && input.saveAsTemplateFeatureEnabled && (input.canBeSavedAsTemplate || input.isCollaboraDocument),
    saveAsTemplateDisabled: editable && input.saveAsTemplateFeatureEnabled && input.isCollaboraDocument,
    movable: input.canMoveSet && input.hasMoveNeighbours,
  };
};
