import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserSecurityAuthenticationMethodsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthenticationType } from '@/core/apollo/generated/graphql-schema';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import useNavigate from '@/core/routing/useNavigate';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import {
  type ConnectedAccountsCredentialRow,
  type ConnectedAccountsFlowMessage,
  type ConnectedAccountsProviderRow,
  ConnectedAccountsView,
} from '@/crd/components/user/settings/ConnectedAccountsView';
import { McpApiKeyCreateDialog } from '@/crd/components/user/settings/McpApiKeyCreateDialog';
import { McpApiKeyRevealPanel } from '@/crd/components/user/settings/McpApiKeyRevealPanel';
import { McpApiKeysCard } from '@/crd/components/user/settings/McpApiKeysCard';
import { UserSecurityTabView, type UserSecurityViewState } from '@/crd/components/user/settings/UserSecurityTabView';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { platformBaseAddress } from '@/main/constants/endpoints';
import { flowDescriptorAdapter } from '@/main/crdPages/auth/flowDescriptorAdapter';
import { invokePasskeyTrigger } from '@/main/crdPages/auth/passkeyTrigger';
import { useKratosMessageCopy } from '@/main/crdPages/auth/useKratosMessageCopy';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import useCanEditUserSettings from '../../useCanEditUserSettings';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import { adaptConnectedAccountsFlow } from './connectedAccountsFlowAdapter';
import PasswordChangeForm from './PasswordChangeForm';
import useMcpApiKeys from './useMcpApiKeys';
import useUserSecuritySettingsFlow from './useUserSecuritySettingsFlow';

// Kratos returns this on the settings flow when a link attempt targets an
// identity already connected to a *different* Alkemio account (FR-006). The
// shared `kratosMessageTranslationKeys` registry keeps this id's existing
// login-context copy (the sign-in screen's duplicate-identity notice), so
// this settings-context reading is applied here instead of there.
const MESSAGE_CODE_IDENTITY_ALREADY_LINKED = 4000007;

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

const OwnerSecurityTabContent = ({ profileUrl }: { profileUrl: string | undefined }) => {
  const { t: tTyped, i18n } = useTranslation('crd-contributorSettings');
  // The Connected Accounts reason/message keys are built at runtime from the
  // adapter's output (an i18n key string, not a literal from the typed
  // resource union) — translate via a plain signature, mirroring
  // `useKratosMessageCopy`'s own cast for the same reason.
  const t = tTyped as unknown as (key: string, options?: Record<string, unknown>) => string;
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

  // Connected Accounts (US1-3, FR-001-FR-012, FR-017-FR-026): derived from
  // the same Settings flow plus the same authentication-methods query the
  // Change Password card already loads — no new round trip (research D2).
  // Fails closed (FR-024) whenever either source hasn't resolved cleanly.
  const authenticationMethods = authData?.me.user?.authentication?.methods;
  const connectedAccountsModel = adaptConnectedAccountsFlow(
    flowResult.kind === 'ready' ? flowResult.flow : undefined,
    flowResult.kind === 'error' ? undefined : authenticationMethods
  );
  const translateKratosMessages = useKratosMessageCopy();
  const connectedAccountsMessages: ConnectedAccountsFlowMessage[] = translateKratosMessages(
    connectedAccountsModel.messages
  ).map(message =>
    message.id === MESSAGE_CODE_IDENTITY_ALREADY_LINKED
      ? {
          id: message.id,
          type: message.type,
          text: t('user.security.connectedAccounts.messages.identityAlreadyLinked'),
        }
      : { id: message.id, type: message.type, text: message.text }
  );
  const connectedAccountsProviders: ConnectedAccountsProviderRow[] = connectedAccountsModel.providers.map(row => ({
    providerId: row.providerId,
    displayName: row.displayName,
    iconSrc: row.iconSrc,
    state: row.state,
    lockedReason: row.lockedReasonKey ? t(row.lockedReasonKey) : undefined,
    action: row.action,
  }));
  const connectedAccountsCredentials: ConnectedAccountsCredentialRow[] = connectedAccountsModel.credentials.map(
    row => ({
      kind: row.kind,
      present: row.present,
      manageHref: buildSettingsTabUrl(profileUrl, 'security', row.kind === 'password' ? 'password' : 'passkeys'),
    })
  );
  const connectedAccountsStatus: 'loading' | 'unavailable' | 'ready' =
    flowResult.kind === 'loading' || authMethodsLoading
      ? 'loading'
      : connectedAccountsModel.status === 'unavailable'
        ? 'unavailable'
        : 'ready';
  const connectedAccountsRetry = () => {
    flowResult.refetch();
    refetchAuthMethods();
  };
  const connectedAccountsSection = (
    <ConnectedAccountsView
      status={connectedAccountsStatus}
      unavailableReason={
        connectedAccountsModel.unavailableReasonKey ? t(connectedAccountsModel.unavailableReasonKey) : undefined
      }
      onRetry={connectedAccountsRetry}
      providers={connectedAccountsProviders}
      credentials={connectedAccountsCredentials}
      messages={connectedAccountsMessages}
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
