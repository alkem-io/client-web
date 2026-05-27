import { useEffect } from 'react';
import type { KratosRemovedFieldAttributes } from '@/core/auth/authentication/components/Kratos/constants';
import KratosForm from '@/core/auth/authentication/components/Kratos/KratosForm';
import KratosUI from '@/core/auth/authentication/components/KratosUI';
import useNavigate from '@/core/routing/useNavigate';
import { UserSecurityTabView, type UserSecurityViewState } from '@/crd/components/user/settings/UserSecurityTabView';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import useCanEditUserSettings from '../../useCanEditUserSettings';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import useUserSecuritySettingsFlow from './useUserSecuritySettingsFlow';

/**
 * Field filter for the password card — keep `password` / `password_identifier`
 * inputs and the `password` submit; strip everything else (profile traits,
 * WebAuthn nodes, OIDC link/unlink).
 */
const PASSWORD_REMOVED_FIELDS: ReadonlyArray<KratosRemovedFieldAttributes> = [
  { name: 'traits.name.first' },
  { name: 'traits.name.last' },
  { name: 'traits.email' },
  { name: 'traits.accepted_terms' },
  { name: 'traits.picture' },
  { type: 'submit', value: 'profile' },
  { name: 'link' },
  { name: 'unlink' },
];

/**
 * Field filter for the WebAuthn / Passkey card — mirrors the existing MUI
 * `UserSecuritySettingsPage` filter: strip password, profile, OIDC.
 */
const WEBAUTHN_REMOVED_FIELDS: ReadonlyArray<KratosRemovedFieldAttributes> = [
  { name: 'password' },
  { name: 'password_identifier' },
  { name: 'traits.name.first' },
  { name: 'traits.name.last' },
  { name: 'traits.email' },
  { name: 'traits.accepted_terms' },
  { name: 'traits.picture' },
  { type: 'submit', value: 'profile' },
  { type: 'submit', value: 'password' },
  { name: 'link' },
  { name: 'unlink' },
];

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

  const flowResult = useUserSecuritySettingsFlow();

  if (!isOwner) {
    return <UserSecurityTabView state={{ kind: 'loading' }} passwordForm={null} webauthnForm={null} />;
  }

  const state: UserSecurityViewState =
    flowResult.kind === 'loading'
      ? { kind: 'loading' }
      : flowResult.kind === 'error'
        ? { kind: 'error' }
        : { kind: 'ready', hasPassword: flowResult.hasPassword, hasWebauthn: flowResult.hasWebauthn };

  const passwordForm =
    flowResult.kind === 'ready' && flowResult.hasPassword ? (
      <KratosForm ui={flowResult.flow.ui}>
        <KratosUI ui={flowResult.flow.ui} removedFields={PASSWORD_REMOVED_FIELDS} flowType="settings" />
      </KratosForm>
    ) : null;

  const webauthnForm =
    flowResult.kind === 'ready' && flowResult.hasWebauthn ? (
      <KratosForm ui={flowResult.flow.ui}>
        <KratosUI ui={flowResult.flow.ui} removedFields={WEBAUTHN_REMOVED_FIELDS} flowType="settings" />
      </KratosForm>
    ) : null;

  return <UserSecurityTabView state={state} passwordForm={passwordForm} webauthnForm={webauthnForm} />;
};

export default CrdUserSecurityTab;
