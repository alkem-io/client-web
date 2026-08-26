import { ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAccountDeletionPreflightLazyQuery, useDeleteUserMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  AUTH_LOGOUT_PATH,
  AUTH_REFRESH_LOGIN_REQUEST,
} from '@/core/auth/authentication/constants/authentication.constants';
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
 * submission, so there is no Kratos-issued redirect to follow. Instead this
 * hook drives the SAME "confirm it is you" flow directly via Kratos's
 * self-service login browser endpoint with `refresh=true`, carrying a resume
 * flag on `return_to` so the Security tab can reopen the confirm dialog (name
 * field cleared, never auto-submitted) once the round trip completes.
 */
const useDeleteAccount = (userId: string | undefined, securityTabUrl: string): UseDeleteAccountResult => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialog, setDialog] = useState<DeleteAccountDialogState>({ kind: 'closed' });

  const [runPreflight] = useAccountDeletionPreflightLazyQuery({ fetchPolicy: 'network-only' });
  const [deleteUserMutation] = useDeleteUserMutation();

  const redirectToReauth = () => {
    const resumeUrl = new URL(securityTabUrl, window.location.origin);
    resumeUrl.searchParams.set(RESUME_QUERY_PARAM, RESUME_QUERY_VALUE);
    const returnTo = `${resumeUrl.pathname}${resumeUrl.search}`;
    window.location.assign(`${AUTH_REFRESH_LOGIN_REQUEST}?refresh=true&return_to=${encodeURIComponent(returnTo)}`);
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
        redirectToReauth();
        return;
      }
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

  // One-shot resume: Kratos lands the browser back here with `?resume=delete-account`
  // once the forced re-login completes. Re-run the pre-flight rather than blindly
  // reopening confirm — a resource created elsewhere during the round trip must
  // still surface as a blocker (TOCTOU), and the freshly-issued session should now
  // pass the freshness check without looping back into another redirect.
  useEffect(() => {
    if (searchParams.get(RESUME_QUERY_PARAM) !== RESUME_QUERY_VALUE) return;
    const next = new URLSearchParams(searchParams);
    next.delete(RESUME_QUERY_PARAM);
    setSearchParams(next, { replace: true });
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
        redirectToReauth();
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

  const onDialogOpenChange = (open: boolean) => {
    if (!open) setDialog({ kind: 'closed' });
  };

  return { dialog, onOpen, onTypedNameChange, onConfirm, onCancel, onDialogOpenChange };
};

export default useDeleteAccount;
