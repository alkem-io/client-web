import { useEffect } from 'react';
import type { KratosRemovedFieldAttributes } from '@/core/auth/authentication/components/Kratos/constants';
import KratosForm from '@/core/auth/authentication/components/Kratos/KratosForm';
import KratosUI from '@/core/auth/authentication/components/KratosUI';
import useNavigate from '@/core/routing/useNavigate';
import { UserSecurityTabView, type UserSecurityViewState } from '@/crd/components/user/settings/UserSecurityTabView';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import useCanEditUserSettings from '../../useCanEditUserSettings';
import useUserPageRouteContext from '../../useUserPageRouteContext';
import useIdentityProviderSettingsFlow from './useIdentityProviderSettingsFlow';

/**
 * Hide everything except the WebAuthn/Passkey nodes — same filter the
 * existing MUI `UserSecuritySettingsPage` uses, lifted here unchanged for
 * parity. Removing this filter would surface the password / profile /
 * OIDC link/unlink fields, which are managed by other settings tabs (or
 * not surfaced at all).
 */
const REMOVED_FIELDS: ReadonlyArray<KratosRemovedFieldAttributes> = [
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
 * **Kratos integration**: the page mounts `<KratosForm><KratosUI /></KratosForm>`
 * directly with the same `REMOVED_FIELDS` filter the MUI page uses. The
 * form fields themselves are NOT restyled (FR-080 / Decision #6 — out of
 * scope for this spec). The CRD layer only restyles the surrounding card.
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

  const flowResult = useIdentityProviderSettingsFlow();

  // Don't render the Kratos form for non-owners while the redirect is in
  // flight — the effect above will navigate away. Loading state covers it.
  if (!isOwner) {
    return <UserSecurityTabView state={{ kind: 'loading' }} kratosForm={null} />;
  }

  const state: UserSecurityViewState =
    flowResult.kind === 'loading'
      ? { kind: 'loading' }
      : flowResult.kind === 'error'
        ? { kind: 'error' }
        : flowResult.kind === 'noWebauthn'
          ? { kind: 'noWebauthn' }
          : { kind: 'ready' };

  const kratosForm =
    flowResult.kind === 'ready' ? (
      <KratosForm ui={flowResult.flow.ui}>
        <KratosUI ui={flowResult.flow.ui} removedFields={REMOVED_FIELDS} flowType="settings" />
      </KratosForm>
    ) : null;

  return <UserSecurityTabView state={state} kratosForm={kratosForm} />;
};

export default CrdUserSecurityTab;
