import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { useSearchParams } from 'react-router-dom';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';

export type UserSecuritySettingsFlowResult =
  | { kind: 'loading'; refetch: () => void }
  | { kind: 'error'; error: Error; refetch: () => void }
  | { kind: 'ready'; flow: SettingsFlow; hasWebauthn: boolean; flowWasResumed: boolean; refetch: () => void };

const hasWebauthnNode = (node: UiNode): boolean => {
  if (node.group === 'webauthn' || node.group === 'passkey') return true;
  const attrs = node.attributes;
  if (
    attrs.node_type === 'input' &&
    'onclickTrigger' in attrs &&
    typeof attrs.onclickTrigger === 'string' &&
    (attrs.onclickTrigger.startsWith('oryWebAuthn') || attrs.onclickTrigger.startsWith('oryPasskey'))
  ) {
    return true;
  }
  return false;
};

/**
 * Loader for the Kratos Settings flow that drives the User Security tab.
 *
 * The Settings flow returned by Kratos contains UI nodes for every
 * configured method on the account (password, webauthn/passkey, oidc,
 * profile, ...). We render different slices of the same flow in their own
 * cards (Change Password, Passkeys, ...), so all callers share a single
 * flow instance — both for fewer round-trips and so that submissions of
 * one slice operate against the same flow id.
 *
 * The flow id query param drives Kratos's resume behaviour (e.g., after a
 * server-side redirect or self-service URL); when absent, Kratos auto-
 * provisions a fresh Settings flow.
 *
 * `returnTo`, when the flow is freshly provisioned, is forwarded to Kratos
 * so it takes precedence over the configured default browser return URL —
 * both an OIDC link's provider round trip and a re-auth (`?refresh=true`)
 * resume land back on this same Security settings URL rather than the
 * platform apex.
 *
 * Note: whether the account actually *has* a password credential is NOT
 * derived from the presence of a `password` node here — Kratos exposes that
 * node whenever the password method is enabled (including offering first-time
 * password set to social-only accounts), which is config-dependent. That gate
 * is answered authoritatively by `User.authentication.methods` (EMAIL) in the
 * consuming tab. This hook only reports the passkey method and the flow.
 *
 * `flowWasResumed` is true exactly when a `flow` id was present on the URL at
 * mount — i.e. Kratos itself sent the browser back here naming a specific,
 * already-existing flow, rather than this hook provisioning a fresh one. A
 * privileged-session re-auth interruption is the case that
 * matters: Kratos's settings UI URL convention is `<ui_url>?flow=<id>`, and
 * that is the URL it redirects back to once the interstitial login flow
 * completes — so a resumed flow is how the Connected Accounts section tells
 * "the identity check the person just completed interrupted an attempt" apart
 * from "that attempt genuinely failed" (see `ConnectedAccountsSection`).
 */
const useUserSecuritySettingsFlow = (returnTo?: string): UserSecuritySettingsFlowResult => {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow') ?? undefined;

  const { flow, error, loading, refetch } = useKratosFlow(FlowTypeName.Settings, flowId, { returnTo });

  if (loading) return { kind: 'loading', refetch };
  if (error) return { kind: 'error', error, refetch };
  if (!flow) return { kind: 'error', error: new Error('Kratos settings flow unavailable'), refetch };

  const nodes = flow.ui?.nodes ?? [];
  return {
    kind: 'ready',
    flow,
    hasWebauthn: nodes.some(hasWebauthnNode),
    flowWasResumed: Boolean(flowId),
    refetch,
  };
};

export default useUserSecuritySettingsFlow;
