import { useEffect } from 'react';
import { useUserSecurityAuthenticationMethodsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthenticationType } from '@/core/apollo/generated/graphql-schema';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import useNavigate from '@/core/routing/useNavigate';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import { UserSecurityTabView, type UserSecurityViewState } from '@/crd/components/user/settings/UserSecurityTabView';
import { flowDescriptorAdapter } from '@/main/crdPages/auth/flowDescriptorAdapter';
import { invokePasskeyTrigger } from '@/main/crdPages/auth/passkeyTrigger';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import useCanEditUserSettings from '../../useCanEditUserSettings';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import PasswordChangeForm from './PasswordChangeForm';
import useUserSecuritySettingsFlow from './useUserSecuritySettingsFlow';

/**
 * Integration page for the User Security tab.
 *
 * **Owner-only access** (FR-012 / FR-083 / FR-084): the Security tab is
 * hidden in the strip for non-owners (handled by `CrdUserSettingsPage`),
 * and a direct hit on this URL by a viewer who is not the owner — even a
 * platform admin — redirects to `/user/<other>/settings/profile`. The
 * shell's general access guard already redirects non-edit viewers to the
 * public profile, but a platform admin passes that guard; this page adds
 * the second-pass owner check.
 *
 * **Kratos integration**: one Settings flow drives two cards — Change
 * Password (password method) and Passkeys (webauthn/passkey method). Both
 * mounts share the same flow instance; submitting one operates against
 * the same flow id. The form fields themselves are NOT restyled — only
 * the surrounding card chrome.
 */
const CrdUserSecurityTab = () => {
  const navigate = useNavigate();
  const { userId, profileUrl } = useUserPageRouteContext();
  const { isOwner, loading: predicateLoading } = useCanEditUserSettings({ profileUserId: userId });

  // Non-owner second-pass redirect (FR-084) — even a platform admin lands
  // on `/user/<other>/settings/profile` rather than seeing this tab.
  useEffect(() => {
    if (predicateLoading) return;
    if (isOwner) return;
    if (!profileUrl) return;
    navigate(buildSettingsTabUrl(profileUrl, 'profile'), { replace: true });
  }, [predicateLoading, isOwner, profileUrl, navigate]);

  // Mount the Kratos settings-flow and credential hooks only for owners.
  // Both carry side effects (a Kratos Settings-flow init request, a GraphQL
  // query); gating them behind the owner check keeps non-owners — including
  // platform admins who pass the shell guard — from triggering those flows
  // before the owner-only redirect above completes.
  if (!isOwner) {
    return <UserSecurityTabView state={{ kind: 'loading' }} passwordForm={null} webauthnForm={null} />;
  }

  return <OwnerSecurityTabContent />;
};

const OwnerSecurityTabContent = () => {
  const flowResult = useUserSecuritySettingsFlow();

  // Load the Ory passkey script so the WebAuthn registration button can run
  // its ceremony (the script injects the `window.__oryPasskey*` globals that
  // `invokePasskeyTrigger` calls). Mirrors the MUI security page's usage.
  const flowNodes = flowResult.kind === 'ready' ? flowResult.flow.ui?.nodes : undefined;
  usePasskeyScript(flowNodes);

  // Whether the account actually has a password credential is answered
  // authoritatively by the server — `User.authentication.methods` includes
  // EMAIL iff a Kratos password credential exists. We intentionally do NOT
  // infer this from the presence of a `password` settings node, which Kratos
  // exposes config-dependently (e.g. offering first-time password set to
  // social-only accounts).
  const { data: authData, loading: authMethodsLoading } = useUserSecurityAuthenticationMethodsQuery();
  const hasPasswordCredential = Boolean(authData?.me.user?.authentication?.methods.includes(AuthenticationType.Email));

  const state: UserSecurityViewState =
    flowResult.kind === 'loading' || authMethodsLoading
      ? { kind: 'loading' }
      : flowResult.kind === 'error'
        ? { kind: 'error' }
        : { kind: 'ready', hasPassword: hasPasswordCredential, hasWebauthn: flowResult.hasWebauthn };

  const passwordForm =
    flowResult.kind === 'ready' && hasPasswordCredential ? <PasswordChangeForm flow={flowResult.flow} /> : null;

  // The WebAuthn / Passkey card renders the same Kratos Settings flow through
  // the MUI-free `CrdKratosFlow`. `keepPasskeys` keeps the passkey-registration
  // node (otherwise stripped for the recovery-completion settings flow), and the
  // adapter already drops the password/profile/oidc nodes for settings flows, so
  // only the passkey registration button surfaces here.
  const webauthnForm =
    flowResult.kind === 'ready' && flowResult.hasWebauthn ? (
      <CrdKratosFlow
        descriptor={flowDescriptorAdapter(flowResult.flow, 'settings', {
          keepPasskeys: true,
          dropPasswordMethod: true,
        })}
        onPasskeyTrigger={trigger => {
          invokePasskeyTrigger(trigger).catch(() => undefined);
        }}
      />
    ) : null;

  return <UserSecurityTabView state={state} passwordForm={passwordForm} webauthnForm={webauthnForm} />;
};

export default CrdUserSecurityTab;
