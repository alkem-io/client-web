import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserSecurityAuthenticationMethodsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthenticationType } from '@/core/apollo/generated/graphql-schema';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import useNavigate from '@/core/routing/useNavigate';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import { McpApiKeyCreateDialog } from '@/crd/components/user/settings/McpApiKeyCreateDialog';
import { McpApiKeyRevealPanel } from '@/crd/components/user/settings/McpApiKeyRevealPanel';
import { McpApiKeysCard } from '@/crd/components/user/settings/McpApiKeysCard';
import { UserSecurityTabView, type UserSecurityViewState } from '@/crd/components/user/settings/UserSecurityTabView';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { platformBaseAddress } from '@/main/constants/endpoints';
import { flowDescriptorAdapter } from '@/main/crdPages/auth/flowDescriptorAdapter';
import { invokePasskeyTrigger } from '@/main/crdPages/auth/passkeyTrigger';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import useCanEditUserSettings from '../../useCanEditUserSettings';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import { ConnectedAccountsSection } from './ConnectedAccountsSection';
import { adaptConnectedAccountsFlow } from './connectedAccountsFlowAdapter';
import PasswordChangeForm from './PasswordChangeForm';
import { passkeyOwnsFlowMessages } from './passkeyFlowMessages';
import useMcpApiKeys from './useMcpApiKeys';
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
  const { userId, profileUrl, loading: routeContextLoading } = useUserPageRouteContext();
  const { isOwner, loading: predicateLoading } = useCanEditUserSettings({ profileUserId: userId });
  const loading = predicateLoading || routeContextLoading;

  // Non-owner second-pass redirect (FR-084) — even a platform admin lands
  // on `/user/<other>/settings/profile` rather than seeing this tab.
  useEffect(() => {
    if (loading) return;
    if (isOwner) return;
    if (!profileUrl) return;
    navigate(buildSettingsTabUrl(profileUrl, 'profile'), { replace: true });
  }, [loading, isOwner, profileUrl, navigate]);

  // Mount the Kratos settings-flow and credential hooks only once the owner
  // check AND `profileUrl` have both resolved. `isOwner` (derived from
  // `useCurrentUserContext`) can turn true before `profileUrl` (derived from
  // the separately-loading `useUserProvider(userId)`) does — mounting on
  // `isOwner` alone would create the Settings flow with an empty `returnTo`,
  // then create a SECOND flow once `profileUrl` resolves and the URL passed
  // to `useUserSecuritySettingsFlow` changes. That second flow can race the
  // first (see `useKratosFlow`'s request-sequence guard) and, either way,
  // remounts this subtree and loses the outcome announcement already shown
  // by `ConnectedAccountsSection`. Both carry side effects (a Kratos
  // Settings-flow init request, a GraphQL query); gating them here also
  // keeps non-owners — including platform admins who pass the shell guard —
  // from triggering those flows before the owner-only redirect above
  // completes.
  if (!isOwner || loading || !profileUrl) {
    return (
      <UserSecurityTabView
        state={{ kind: 'loading' }}
        passwordForm={null}
        webauthnForm={null}
        mcpApiKeysCard={null}
        connectedAccountsSection={null}
      />
    );
  }

  return <OwnerSecurityTabContent profileUrl={profileUrl} />;
};

const OwnerSecurityTabContent = ({ profileUrl }: { profileUrl: string }) => {
  const { i18n } = useTranslation('crd-contributorSettings');
  // The Settings flow is created with `return_to` = this same Security tab
  // URL so an OIDC link's provider round trip and a re-auth resume both land
  // back on the Connected Accounts section instead of the platform apex.
  const flowResult = useUserSecuritySettingsFlow(buildSettingsTabUrl(profileUrl, 'security'));
  const mcpApiKeys = useMcpApiKeys();
  const dateLocale = resolveDateFnsLocale(i18n.language);

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
  const {
    data: authData,
    loading: authMethodsLoading,
    refetch: refetchAuthMethods,
  } = useUserSecurityAuthenticationMethodsQuery();
  const hasPasswordCredential = Boolean(authData?.me.user?.authentication?.methods.includes(AuthenticationType.Email));

  // A lapsed identity-provider session gets its own state, ahead of the generic
  // error one. The way out is the platform's sign-out route, not sign-in:
  // re-entering sign-in alone leaves the lapsed session lapsed, because the
  // login provider accepts the subject the broker still holds for this browser
  // without ever re-authenticating against the identity provider. Signing out
  // ends the broker session as well, so the next sign-in has to be genuine and
  // mints the session this tab needs.
  const state: UserSecurityViewState =
    flowResult.kind === 'loading' || authMethodsLoading
      ? { kind: 'loading' }
      : flowResult.kind === 'sessionExpired'
        ? { kind: 'sessionExpired', reauthHref: AUTH_LOGOUT_PATH }
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
          // Flow-level messages render in the card owning the method that
          // produced them (`flow.active`) — only passkey outcomes belong here.
          // `active` absent means Kratos attributed the outcome to nothing — keeping the
          // message would be a guess, and guessing is what put a password outcome in this
          // card before (T028). Only an explicitly passkey-owned outcome stays.
          dropFlowMessages: !passkeyOwnsFlowMessages(flowResult.flow.active),
        })}
        onPasskeyTrigger={trigger => {
          invokePasskeyTrigger(trigger).catch(() => undefined);
        }}
      />
    ) : null;

  // Connected Accounts (US1-3, FR-001-FR-012, FR-017-FR-026): derived from
  // the same Settings flow plus the same authentication-methods query the
  // Change Password card already loads — no new round trip (research D2).
  // Fails closed (FR-024) whenever either source hasn't resolved cleanly.
  const authenticationMethods = authData?.me.user?.authentication?.methods;
  const connectedAccountsModel = adaptConnectedAccountsFlow(
    flowResult.kind === 'ready' ? flowResult.flow : undefined,
    // A lapsed identity-provider session withholds the methods for the same
    // fail-closed reason a load error does: without the settings flow there is
    // nothing to reconcile them against.
    flowResult.kind === 'error' || flowResult.kind === 'sessionExpired' ? undefined : authenticationMethods
  );
  const connectedAccountsStatus: 'loading' | 'unavailable' | 'ready' =
    flowResult.kind === 'loading' || authMethodsLoading
      ? 'loading'
      : connectedAccountsModel.status === 'unavailable'
        ? 'unavailable'
        : 'ready';
  const connectedAccountsSection = (
    <ConnectedAccountsSection
      status={connectedAccountsStatus}
      model={connectedAccountsModel}
      flowWasResumed={flowResult.kind === 'ready' && flowResult.flowWasResumed}
      onRetry={() => {
        flowResult.refetch();
        refetchAuthMethods();
      }}
    />
  );

  const mcpApiKeysCard = (
    <>
      <McpApiKeysCard
        loading={mcpApiKeys.loading}
        loadError={mcpApiKeys.loadError}
        onRetry={mcpApiKeys.retryLoad}
        keys={mcpApiKeys.keys}
        revokingId={mcpApiKeys.revokingId}
        interruptedRevealKeyId={mcpApiKeys.interruptedRevealKeyId}
        onCreate={mcpApiKeys.openCreateDialog}
        onRevoke={mcpApiKeys.revokeKey}
        locale={dateLocale}
      />
      <McpApiKeyCreateDialog
        open={mcpApiKeys.createDialogOpen}
        onOpenChange={next => (next ? mcpApiKeys.openCreateDialog() : mcpApiKeys.closeCreateDialog())}
        submitting={mcpApiKeys.creating}
        serverError={mcpApiKeys.createError}
        onCreate={mcpApiKeys.createKey}
        locale={dateLocale}
      />
      <McpApiKeyRevealPanel
        open={Boolean(mcpApiKeys.revealData)}
        data={mcpApiKeys.revealData}
        baseAddress={platformBaseAddress}
        onClose={mcpApiKeys.closeReveal}
        onCopied={mcpApiKeys.onRevealCopied}
      />
    </>
  );

  return (
    <UserSecurityTabView
      state={state}
      passwordForm={passwordForm}
      webauthnForm={webauthnForm}
      mcpApiKeysCard={mcpApiKeysCard}
      connectedAccountsSection={connectedAccountsSection}
    />
  );
};

export default CrdUserSecurityTab;
