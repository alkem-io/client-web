import type { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

/**
 * Why an action is in its current state. Callers map this to localized copy —
 * `checking` and `denied` and `unverifiable` each get their own message.
 */
export type ActionPermissionReason = 'allowed' | 'checking' | 'denied' | 'unverifiable';

export type ActionPermission = {
  /** true only when every required privilege is present. */
  allowed: boolean;
  reason: ActionPermissionReason;
};

/**
 * Single source of truth for whether the current user may perform a role-assignment action.
 *
 * Pure derivation over data the caller already holds — it issues no query, so gating adds
 * no network round-trip. The required privilege is passed in rather than hard-coded: the
 * backend enforces different tokens per surface (`GRANT` on the platform role set,
 * `ROLESET_ENTRY_ROLE_ASSIGN` on space/organization role sets, and an additional
 * `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` for organization rows).
 *
 * Precedence is deliberate and ordered — the first matching rule wins:
 *
 * | # | `required` | `loading` | `myPrivileges` | result                    |
 * |---|------------|-----------|----------------|---------------------------|
 * | 1 | empty      | any       | any            | `denied`                  |
 * | 2 | non-empty  | true      | any            | `checking`                |
 * | 3 | non-empty  | false     | undefined      | `unverifiable`            |
 * | 4 | non-empty  | false     | array          | `denied` unless satisfied |
 *
 * An empty `required` list outranks `loading`: it means a caller forgot to supply a token,
 * which never resolves to allowed, so it must not present as a transient "still checking"
 * state. Every non-affirmative input fails closed.
 */
const useActionPermission = (
  myPrivileges: AuthorizationPrivilege[] | undefined,
  required: AuthorizationPrivilege[],
  loading: boolean
): ActionPermission => {
  if (required.length === 0) {
    return { allowed: false, reason: 'denied' };
  }

  if (loading) {
    return { allowed: false, reason: 'checking' };
  }

  if (!myPrivileges) {
    return { allowed: false, reason: 'unverifiable' };
  }

  const satisfied = required.every(privilege => myPrivileges.includes(privilege));

  return satisfied ? { allowed: true, reason: 'allowed' } : { allowed: false, reason: 'denied' };
};

export default useActionPermission;
