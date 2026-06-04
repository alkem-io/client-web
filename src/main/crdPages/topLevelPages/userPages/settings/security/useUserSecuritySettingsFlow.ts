import type { SettingsFlow, UiNode } from '@ory/kratos-client';
import { useSearchParams } from 'react-router-dom';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';

export type UserSecuritySettingsFlowResult =
  | { kind: 'loading' }
  | { kind: 'error'; error: Error }
  | { kind: 'ready'; flow: SettingsFlow; hasWebauthn: boolean };

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
 * Note: whether the account actually *has* a password credential is NOT
 * derived from the presence of a `password` node here — Kratos exposes that
 * node whenever the password method is enabled (including offering first-time
 * password set to social-only accounts), which is config-dependent. That gate
 * is answered authoritatively by `User.authentication.methods` (EMAIL) in the
 * consuming tab. This hook only reports the passkey method and the flow.
 */
const useUserSecuritySettingsFlow = (): UserSecuritySettingsFlowResult => {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow') ?? undefined;

  const { flow, error, loading } = useKratosFlow(FlowTypeName.Settings, flowId);

  if (loading) return { kind: 'loading' };
  if (error) return { kind: 'error', error };
  if (!flow) return { kind: 'error', error: new Error('Kratos settings flow unavailable') };

  const nodes = flow.ui?.nodes ?? [];
  return {
    kind: 'ready',
    flow,
    hasWebauthn: nodes.some(hasWebauthnNode),
  };
};

export default useUserSecuritySettingsFlow;
