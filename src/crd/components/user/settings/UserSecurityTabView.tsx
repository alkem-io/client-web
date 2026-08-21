import { Info, KeyRound, Link2, Plug, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type UserSecurityViewState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; hasPassword: boolean; hasWebauthn: boolean };

export type UserSecurityTabViewProps = {
  state: UserSecurityViewState;
  /**
   * Slot for the password-section Kratos UI mount (`<KratosForm><KratosUI /></KratosForm>`
   * filtered to the `password` group). Provided by the integration page so
   * the CRD view stays free of direct Kratos imports. Only rendered when
   * `state.kind === 'ready'` and `state.hasPassword === true`.
   */
  passwordForm: ReactNode;
  /**
   * Slot for the WebAuthn / Passkey Kratos UI mount. Provided by the
   * integration page; rendered when `state.kind === 'ready'` and
   * `state.hasWebauthn === true`.
   */
  webauthnForm: ReactNode;
  /**
   * Slot for the MCP API Keys card (038). Provided by the integration page
   * so the CRD view stays free of Apollo/GraphQL imports; rendered whenever
   * `state.kind === 'ready'` — the card has its own loading/empty states.
   */
  mcpApiKeysCard: ReactNode;
  /**
   * Slot for the Connected Accounts section (051) — every way to sign in:
   * each identity provider plus password/passkey state rows. Provided by
   * the integration page; carries its own loading/unavailable states, so it
   * renders whenever `state.kind === 'ready'` alongside the other cards.
   */
  connectedAccountsSection: ReactNode;
};

/**
 * User Security tab — presentational chrome only. The CRD layer wraps the
 * Kratos password and passkey forms in two `SettingsCard`s; the form
 * fields themselves are NOT restyled (FR-080 — out of scope).
 */
export function UserSecurityTabView({
  state,
  passwordForm,
  webauthnForm,
  mcpApiKeysCard,
  connectedAccountsSection,
}: UserSecurityTabViewProps) {
  const { t } = useTranslation(NS);

  if (state.kind === 'loading') {
    // The Connected Accounts card — and the outcome live region inside it — renders here too,
    // not just in the 'ready' branch below. Kratos's redirect back from a link/unlink attempt can
    // land while this tab is still on its own loading gate (the flow/auth-methods query hasn't
    // resolved yet); a live region only announces mutations that happen after it exists in the DOM,
    // so if this branch dropped the section entirely, the very first commit that carries a Kratos
    // outcome message would insert the region already populated and announce nothing (FR-012).
    // `connectedAccountsSection` carries its own 'loading' status/skeleton, so this is safe to
    // render even before it has anything to show.
    return (
      <div className="space-y-6">
        <SettingsCard
          icon={Link2}
          title={t('user.security.connectedAccounts.title')}
          description={t('user.security.connectedAccounts.description')}
        >
          {connectedAccountsSection}
        </SettingsCard>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.kind === 'error') {
    // The Kratos settings flow itself failed to load (network/5xx) — the Change Password, Passkey,
    // and MCP API Keys cards genuinely have nothing to render, so the generic error card below still
    // covers those. But Connected Accounts fails closed on its own (FR-024): `connectedAccountsSection`
    // already carries an 'unavailable' status with a plain-language reason and a retry button that
    // re-initializes the settings flow, so dropping it here — as the bare error card alone did — would
    // silently swallow the one actionable recovery path this tab has for a flow-load failure.
    return (
      <div className="space-y-6">
        <SettingsCard
          icon={Link2}
          title={t('user.security.connectedAccounts.title')}
          description={t('user.security.connectedAccounts.description')}
        >
          {connectedAccountsSection}
        </SettingsCard>
        <SettingsCard icon={ShieldAlert} title={t('user.security.title')}>
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-body text-destructive">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{t('user.security.errorDescription')}</p>
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Link2}
        title={t('user.security.connectedAccounts.title')}
        description={t('user.security.connectedAccounts.description')}
      >
        {connectedAccountsSection}
      </SettingsCard>
      {/* scroll-mt offsets in-page anchor jumps (#password / #passkeys) below the sticky
          chrome: the h-16 app header + the SettingsShell header band (~147px). */}
      <div id="password" className="scroll-mt-60">
        <SettingsCard
          icon={KeyRound}
          title={t('user.security.password.title')}
          description={t('user.security.password.description')}
        >
          {state.hasPassword ? (
            <div className="mt-2">{passwordForm}</div>
          ) : (
            <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-4 text-body text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{t('user.security.password.notEnabled')}</p>
            </div>
          )}
        </SettingsCard>
      </div>
      <div id="passkeys" className="scroll-mt-60">
        <SettingsCard icon={ShieldCheck} title={t('user.security.title')} description={t('user.security.description')}>
          {state.hasWebauthn ? (
            <div className="mt-2">{webauthnForm}</div>
          ) : (
            <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-4 text-body text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{t('user.security.notEnabled')}</p>
            </div>
          )}
        </SettingsCard>
      </div>
      <SettingsCard
        icon={Plug}
        title={t('user.security.mcpApiKeys.title')}
        description={t('user.security.mcpApiKeys.description')}
      >
        {mcpApiKeysCard}
      </SettingsCard>
    </div>
  );
}
