import type { SettingsFlow } from '@ory/kratos-client';
import { useSearchParams } from 'react-router-dom';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';

export type IdentityProviderSettingsFlowResult =
  | { kind: 'loading' }
  | { kind: 'error'; error: Error }
  | { kind: 'noWebauthn'; flow: SettingsFlow }
  | { kind: 'ready'; flow: SettingsFlow };

/**
 * Identity-provider Settings flow loader (research §6 / Decision #6).
 *
 * Wraps the existing `useKratosFlow(Settings, flowId)` and inspects the UI
 * nodes to detect whether WebAuthn / Passkey is enabled on this account.
 * The Security tab uses the discriminated result to decide between four
 * render states (loading / error / no-webauthn info alert / passkey form).
 *
 * The flow id query param drives Kratos's resume behaviour (e.g., after a
 * server-side redirect or self-service URL); when absent, Kratos auto-
 * provisions a fresh Settings flow.
 */
const useIdentityProviderSettingsFlow = (): IdentityProviderSettingsFlowResult => {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow') ?? undefined;

  const { flow, error, loading } = useKratosFlow(FlowTypeName.Settings, flowId);

  if (loading) return { kind: 'loading' };
  if (error) return { kind: 'error', error };
  if (!flow) return { kind: 'error', error: new Error('Kratos settings flow unavailable') };

  const hasWebAuthnNodes = flow.ui?.nodes?.some(node => {
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
  });

  return hasWebAuthnNodes ? { kind: 'ready', flow } : { kind: 'noWebauthn', flow };
};

export default useIdentityProviderSettingsFlow;
