import { ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccountDeletionPreflightLazyQuery, useDeleteUserMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  AUTH_LOGOUT_PATH,
  DELETE_ACCOUNT_REAUTH_ATTEMPTED_KEY,
  OIDC_LOGIN_PATH,
} from '@/core/auth/authentication/constants/authentication.constants';
import { useKratosLogout } from '@/core/auth/authentication/hooks/useKratosLogout';
import useNavigate from '@/core/routing/useNavigate';
import type {
  DeleteAccountBlocker,
  DeleteAccountBlockerTotal,
  DeleteAccountDialogState,
} from '@/crd/components/user/settings/DeleteAccount.types';

const RESUME_QUERY_PARAM = 'resume';
const RESUME_QUERY_VALUE = 'delete-account';

const SESSION_REFRESH_REQUIRED = 'SESSION_REFRESH_REQUIRED';
const ACCOUNT_DELETION_BLOCKED = 'ACCOUNT_DELETION_BLOCKED';

type PreflightBlocker = {
  kind: string;
  resourceID: string;
  displayName: string;
  url?: string | null;
  selfResolvable: boolean;
};

type PreflightTotal = { kind: string; total: number };

const mapBlockers = (blockers: PreflightBlocker[]): DeleteAccountBlocker[] =>
  blockers.map(blocker => ({
    kind: blocker.kind as DeleteAccountBlocker['kind'],
    resourceID: blocker.resourceID,
    displayName: blocker.displayName,
    url: blocker.url ?? undefined,
    selfResolvable: blocker.selfResolvable,
  }));

const mapTotals = (totals: PreflightTotal[]): DeleteAccountBlockerTotal[] =>
  totals.map(total => ({ kind: total.kind as DeleteAccountBlockerTotal['kind'], total: total.total }));

const graphQLErrorCode = (error: unknown): string | undefined =>
  error instanceof ApolloError ? (error.graphQLErrors[0]?.extensions?.code as string | undefined) : undefined;

export type UseDeleteAccountResult = {
  dialog: DeleteAccountDialogState;
  onOpen: () => void;
  onTypedNameChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDialogOpenChange: (open: boolean) => void;
};

/**
 * Connector for the Delete-account card (US1-US4). Owns the pre-flight read,
 * the reused `deleteUser` mutation, and the re-authentication round trip for
 * a stale session.
 *
 * Freshness routing happens BEFORE either dialog ever opens (data-model.md
 * §9): the pre-flight's `sessionFresh` flag, evaluated on every open, sends a
 * stale session straight to Kratos's forced re-login rather than showing the
 * confirm dialog first. A session that goes stale mid-flow is caught a
 * second time by the mutation's own `SESSION_REFRESH_REQUIRED` refusal — the
 * pre-flight answer is advisory, the mutation is authoritative.
 *
 * The Settings flow's own privileged-session redirect (`useKratosFlow`,
 * triggered by a Kratos-native form submission returning HTTP 403) does not
 * apply here — `deleteUser` is a plain GraphQL mutation, not a Kratos flow
 * submission, so there is no Kratos-issued redirect to follow. This hook
 * instead forces re-authentication through the OIDC BFF login route (the
 * same one every other forced re-login in this app uses) so the round trip
 * re-mints the `alkemio_session` BFF cookie whose `created_at` the server
 * reads for freshness — a Kratos SSO-only refresh would satisfy neither the
 * server's session-freshness gate nor its audit trail.
 *
 * That BFF round trip alone is NOT a credential check: as long as the
 * browser's Kratos SSO session is still live, the login provider completes
 * it silently against that session with no password/passkey prompt at all
 * (the exact mechanism `useOidcSessionRecovery` relies on elsewhere to avoid
 * ever showing a login form). A freshness gate satisfied that way proves
 * nothing about who is at the keyboard. So before requesting the BFF round
 * trip, `redirectToReauth` first ends the actual Kratos SSO session for this
 * browser (`useKratosLogout().endKratosSsoSession`) via a credentialed fetch
 * to the Kratos-issued logout URL, not a full navigation, so the single
 * delete-account redirect chain is preserved. With no live Kratos session
 * left to ride, the BFF round trip that follows lands on Kratos's own login
 * screen and genuinely re-runs whichever method the identity actually has
 * (password, passkey, or a linked external provider — FR-013).
 *
 * This step is fail-CLOSED, not best-effort: `endKratosSsoSession` reports
 * `'no-session'` when there was genuinely nothing to end (safe to proceed —
 * an already-absent session cannot be silently ridden either) and `'ended'`
 * when the termination is confirmed, but a `'failed'` outcome (the session's
 * true state is unknown — e.g. a Kratos outage or a CORS/origin change)
 * stops here and surfaces the existing `reauth-failed` dialog instead of
 * falling through to the BFF redirect. A silent fallthrough on failure would
 * let exactly the outage it is guarding against downgrade the step-up gate
 * back into an automated, credential-less bounce. A resume flag rides on
 * `returnTo` so the Security tab can reopen the confirm dialog (name field
 * cleared, never auto-submitted) once the round trip completes.
 */
const useDeleteAccount = (userId: string | undefined, securityTabUrl: string): UseDeleteAccountResult => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialog, setDialog] = useState<DeleteAccountDialogState>({ kind: 'closed' });

  const [runPreflight] = useAccountDeletionPreflightLazyQuery({ fetchPolicy: 'network-only' });
  const [deleteUserMutation] = useDeleteUserMutation();
  const { endKratosSsoSession } = useKratosLogout();

  const redirectToReauth = async (): Promise<void> => {
    // Ends the live Kratos SSO session BEFORE the BFF redirect below, so
    // that redirect cannot silently ride it (see the docblock above). The
    // marker is set only once the redirect actually fires, further down —
    // not here — so a failed attempt never poisons the one-shot resume guard
    // and a retry (re-opening the trigger) can try again.
    const outcome = await endKratosSsoSession();
    if (outcome === 'failed') {
      setDialog({ kind: 'reauth-failed' });
      return;
    }
    const resumeUrl = new URL(securityTabUrl, window.location.origin);
    resumeUrl.searchParams.set(RESUME_QUERY_PARAM, RESUME_QUERY_VALUE);
    const returnTo = `${resumeUrl.pathname}${resumeUrl.search}`;
    sessionStorage.setItem(DELETE_ACCOUNT_REAUTH_ATTEMPTED_KEY, '1');
    window.location.assign(`${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const openFromPreflight = async () => {
    setDialog({ kind: 'preflight-loading' });
    try {
      const { data } = await runPreflight();
      const status = data?.me.accountDeletion;
      if (!status) {
        setDialog({ kind: 'preflight-error' });
        return;
      }
      if (!status.sessionFresh) {
        // A resumed pre-flight (the round trip just completed) that STILL
        // finds the session stale would redirect forever if retried blindly
        // — the marker means this tab already made that one attempt, so
        // stop here instead of looping back into another forced re-login.
        if (sessionStorage.getItem(DELETE_ACCOUNT_REAUTH_ATTEMPTED_KEY) === '1') {
          setDialog({ kind: 'reauth-failed' });
          return;
        }
        await redirectToReauth();
        return;
      }
      sessionStorage.removeItem(DELETE_ACCOUNT_REAUTH_ATTEMPTED_KEY);
      if (!status.canDelete) {
        setDialog({
          kind: 'blocked',
          blockers: mapBlockers(status.blockers),
          totals: mapTotals(status.totals),
          truncated: status.truncated,
        });
        return;
      }
      setDialog({
        kind: 'confirm',
        typedName: '',
        deleting: false,
        error: false,
        externalSubscriptionLinked: status.externalSubscriptionLinked,
      });
    } catch {
      setDialog({ kind: 'preflight-error' });
    }
  };

  // One-shot resume: the OIDC BFF lands the browser back here with
  // `?resume=delete-account` once the forced re-login completes. Re-run the
  // pre-flight rather than blindly reopening confirm — a resource created
  // elsewhere during the round trip must still surface as a blocker (TOCTOU),
  // and the freshly-issued session should now pass the freshness check.
  // Only honour the flag when this tab's own redirectToReauth set the
  // matching marker — a `?resume=delete-account` link supplied any other way
  // (e.g. sent to a signed-in victim) can never carry it, so it is ignored
  // rather than treated as a resumed round trip.
  useEffect(() => {
    if (searchParams.get(RESUME_QUERY_PARAM) !== RESUME_QUERY_VALUE) return;
    const next = new URLSearchParams(searchParams);
    next.delete(RESUME_QUERY_PARAM);
    setSearchParams(next, { replace: true });
    if (sessionStorage.getItem(DELETE_ACCOUNT_REAUTH_ATTEMPTED_KEY) !== '1') return;
    void openFromPreflight();
    // Runs once per resumed mount only — deliberately not re-run on every
    // searchParams/setSearchParams identity change (this repo's lint config
    // has no exhaustive-deps rule to satisfy either way).
  }, []);

  const onOpen = () => {
    void openFromPreflight();
  };

  const onTypedNameChange = (value: string) => {
    setDialog(current => (current.kind === 'confirm' ? { ...current, typedName: value, error: false } : current));
  };

  const onConfirm = async () => {
    if (dialog.kind !== 'confirm' || !userId) return;
    setDialog({ ...dialog, deleting: true, error: false });
    try {
      await deleteUserMutation({ variables: { input: { ID: userId } } });
      navigate(AUTH_LOGOUT_PATH);
    } catch (error) {
      const code = graphQLErrorCode(error);
      if (code === SESSION_REFRESH_REQUIRED) {
        await redirectToReauth();
        return;
      }
      if (code === ACCOUNT_DELETION_BLOCKED) {
        // Authoritative TOCTOU refusal — re-run the pre-flight and render the
        // blocked dialog from the fresh server answer, never from the stale
        // "you can delete" state that got the user into the confirm dialog.
        await openFromPreflight();
        return;
      }
      setDialog(current => (current.kind === 'confirm' ? { ...current, deleting: false, error: true } : current));
    }
  };

  const onCancel = () => {
    setDialog({ kind: 'closed' });
  };

  // Radix's AlertDialogAction (the confirm button) closes the dialog itself
  // on click, in the SAME click as onConfirm — so a mutation that is still
  // in flight (or about to reject) must not be allowed to close here, or the
  // rejection branch below updates a dialog state nothing is rendering
  // anymore and the user sees no error at all. Ignoring the close while
  // `deleting` is true keeps the dialog mounted until onConfirm's own
  // success (navigate away) or failure (setDialog with `error: true`)
  // branch decides what happens next; Cancel stays disabled for the same
  // duration, so this never blocks a legitimate close.
  const onDialogOpenChange = (open: boolean) => {
    if (open) return;
    setDialog(current => (current.kind === 'confirm' && current.deleting ? current : { kind: 'closed' }));
  };

  return { dialog, onOpen, onTypedNameChange, onConfirm, onCancel, onDialogOpenChange };
};

export default useDeleteAccount;
