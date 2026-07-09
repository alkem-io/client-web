import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const has = (privileges: AuthorizationPrivilege[] | undefined, privilege: AuthorizationPrivilege): boolean =>
  privileges?.includes(privilege) ?? false;

/**
 * The rename-permission rule for a Collabora (OfficeDocs) document: a user may rename it if
 * they can edit the **document** OR the **callout**. Single source of truth, shared by every
 * caller so the rule stays consistent.
 *
 * `includeContentEditors` widens the rule to also allow a **content editor** — a user with
 * `UPDATE_CONTENT` on the document (granted from `CONTRIBUTE`, i.e. anyone who can write the
 * file in Collabora), which for framing docs is broader than the callout-tied `UPDATE`. Used
 * by the in-editor pencil, where a content-writer should be able to rename the open document.
 * The server's `updateCollaboraDocument` mutation accepts `UPDATE_CONTENT` too, so this is
 * consistent end-to-end. Leave it off for callout-management surfaces that should gate on
 * `UPDATE` only.
 */
export const canRenameCollaboraDocument = (args: {
  documentPrivileges: AuthorizationPrivilege[] | undefined;
  calloutPrivileges: AuthorizationPrivilege[] | undefined;
  includeContentEditors?: boolean;
}): boolean =>
  has(args.documentPrivileges, AuthorizationPrivilege.Update) ||
  has(args.calloutPrivileges, AuthorizationPrivilege.Update) ||
  (args.includeContentEditors === true && has(args.documentPrivileges, AuthorizationPrivilege.UpdateContent));
