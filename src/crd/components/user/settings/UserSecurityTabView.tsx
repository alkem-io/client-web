import { Info, KeyRound, Link2, Plug, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type UserSecurityViewState =
  | { kind: 'loading' }
  /**
   * The identity provider's own session has lapsed while the platform session
   * is still alive, so this tab — the only one that talks to the identity
   * provider directly — cannot load. Deliberately separate from `error`: the
   * generic error tells people to refresh, and refreshing provably cannot fix
   * this.
   *
   * `reauthHref` is the way out, supplied by the integration page. It points at
   * the platform's sign-out route rather than straight back at sign-in,
   * because re-entering sign-in on its own does not rebuild the lapsed
   * identity-provider session: the login provider accepts the subject the
   * broker still remembers for this browser and never re-authenticates, so the
   * tab would fail identically on return. Signing out ends the broker session
   * too, which forces the next sign-in to be a real one.
   */
  | { kind: 'sessionExpired'; reauthHref: string }
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
   * Slot for the Connected Accounts section — every way to sign in: each
   * identity provider plus password/passkey state rows. Provided by the
   * integration page; carries its own loading/unavailable/lapsed-session
   * states, so it renders in every view state rather than waiting for the
   * Kratos settings flow the rest of this tab gates on.
   */
  connectedAccountsSection: ReactNode;
  /**
   * Slot for the Delete-account card. Provided by the integration page so the
   * CRD view stays free of Apollo/GraphQL imports; the card owns its own
   * pre-flight read and dialog state, so — like `connectedAccountsSection`
   * — it renders in every view state, never only once the unrelated Kratos
   * settings flow this tab otherwise gates on has finished loading.
   */
  deleteAccountCard: ReactNode;
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
  deleteAccountCard,
}: UserSecurityTabViewProps) {
  const { t } = useTranslation(NS);

  // Only the middle of this tab varies by state. Connected Accounts and Delete-account are both
  // self-contained — each owns its own read, its own status/skeleton and its own dialogs, and
  // neither depends on the Kratos settings flow the rest of the tab gates on — so both render from
  // the single site at the bottom of this component, in every state:
  //
  //   - The app-store-mandated deletion entry point has to be reachable whatever that settings flow
  //     is doing, a lapsed identity-provider session included. The server gates deletion on the
  //     freshness of the platform session, never on the identity provider's, so a deletion started
  //     from the lapsed state still goes through. That matters most in the mobile app shell, where
  //     the WebView holds no identity-provider session at all and this tab is therefore always in
  //     the lapsed state — withholding the card there left no way to delete an account.
  //   - Connected Accounts holds the Kratos outcome live region. A link/unlink redirect can land
  //     while this tab is still on its own loading gate, and a live region only announces mutations
  //     that happen after it exists in the DOM, so a state that dropped the section would insert the
  //     region already populated and announce nothing. It also fails closed on its own terms: its
  //     unavailable state carries the reason and the retry that re-initializes the flow, which is
  //     the only recovery path this tab offers for a flow-load failure.
  //
  // Repeating them per state is what cost the deletion entry point once already — a state added
  // later simply did not carry the card forward — so there is deliberately nothing to repeat.
  let stateBody: ReactNode;

  if (state.kind === 'loading') {
    stateBody = <Skeleton className="h-64 w-full" />;
  } else if (state.kind === 'sessionExpired') {
    // Same shape as the generic error state below, but this card names the actual cause and offers
    // the only action that resolves it. Sending someone to refresh here would strand them: the
    // platform session that keeps every other page working renews itself without ever consulting
    // the identity provider, so no number of reloads will produce the session this tab needs.
    // Connected Accounts renders above in its own lapsed-session state, which withholds the retry
    // its unavailable state offers for the same reason and points at the action here instead of
    // repeating it.
    stateBody = (
      <SettingsCard icon={ShieldAlert} title={t('user.security.title')}>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-4 text-body text-muted-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{t('user.security.sessionExpired.description')}</p>
          </div>
          <Button asChild={true} className="self-start">
            <a href={state.reauthHref}>{t('user.security.sessionExpired.action')}</a>
          </Button>
        </div>
      </SettingsCard>
    );
  } else if (state.kind === 'error') {
    // The Kratos settings flow itself failed to load (network/5xx), so the Change Password, Passkey
    // and MCP API Keys cards genuinely have nothing to render and one generic card covers all three.
    stateBody = (
      <SettingsCard icon={ShieldAlert} title={t('user.security.title')}>
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-body text-destructive">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{t('user.security.errorDescription')}</p>
        </div>
      </SettingsCard>
    );
  } else {
    stateBody = (
      <>
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
          <SettingsCard
            icon={ShieldCheck}
            title={t('user.security.title')}
            description={t('user.security.description')}
          >
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
      </>
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
      {stateBody}
      <SettingsCard
        icon={Trash2}
        title={t('user.security.deleteAccount.title')}
        description={t('user.security.deleteAccount.description')}
      >
        {deleteAccountCard}
      </SettingsCard>
    </div>
  );
}
