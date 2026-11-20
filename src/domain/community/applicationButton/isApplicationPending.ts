import { ApplicationState } from '../invitations/InvitationApplicationConstants';

/**
 * The single owner of "this application is still awaiting a decision".
 *
 * Derived from `ApplicationState` rather than hand-written literals. There used
 * to be three copies of this predicate — here, in `SpaceAboutApplyButton` and in
 * `PreApplicationDialog` — each spelling the set out by hand, and they disagreed:
 * `{new, rejected}` vs `{new, archived}`. So the same application could read as
 * pending in one place and terminal in another, and `approving` was missed by all
 * three. NEW is awaiting review and APPROVING is the transient server-side
 * approval step; APPROVED, REJECTED and ARCHIVED are terminal — the application
 * is closed, whether or not the user may now re-apply.
 */
const PENDING_STATES: ReadonlySet<string> = new Set([ApplicationState.NEW, ApplicationState.APPROVING]);

const isApplicationPending = (applicationState?: string): boolean =>
  !!applicationState && PENDING_STATES.has(applicationState);

export default isApplicationPending;
