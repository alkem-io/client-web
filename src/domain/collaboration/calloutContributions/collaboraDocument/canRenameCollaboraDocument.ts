import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const hasUpdate = (privileges: AuthorizationPrivilege[] | undefined): boolean =>
  privileges?.includes(AuthorizationPrivilege.Update) ?? false;

/**
 * The rename-permission rule for a Collabora (OfficeDocs) document (spec 114 / FR-001):
 * a user may rename it if they can edit the **document** OR the **callout** — two
 * independent `Update` privileges. This is the single source of truth, shared by the
 * editor-overlay callers, the standalone-dialog caller, and the context-menu gate, so
 * the rule can only change in one place.
 */
export const canRenameCollaboraDocument = (args: {
  documentPrivileges: AuthorizationPrivilege[] | undefined;
  calloutPrivileges: AuthorizationPrivilege[] | undefined;
}): boolean => hasUpdate(args.documentPrivileges) || hasUpdate(args.calloutPrivileges);
