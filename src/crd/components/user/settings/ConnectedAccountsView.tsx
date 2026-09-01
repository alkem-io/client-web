import { AlertCircle, Info, KeyRound, Link2, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type ConnectedAccountsProviderAction = {
  kind: 'link' | 'unlink';
  /** The flow's own `ui.action` — this row's form POSTs here (research D1). */
  formAction: string;
  method: 'POST' | 'GET';
  /** The flow's CSRF hidden node, replicated verbatim into this row's form. */
  csrf: { name: string; value: string };
  submitName: string;
  submitValue: string;
};

export type ConnectedAccountsProviderRow = {
  providerId: string;
  displayName: string;
  iconSrc?: string;
  state: 'not-connected' | 'connected' | 'connected-locked';
  /** Already-translated; set only when `state === 'connected-locked'` (FR-008). */
  lockedReason?: string;
  /** `null` exactly when `state === 'connected-locked'`. */
  action: ConnectedAccountsProviderAction | null;
};

export type ConnectedAccountsCredentialRow = {
  kind: 'password' | 'passkey';
  present: boolean;
  /** In-page route to the existing Change Password / Passkeys section (FR-022). */
  manageHref: string;
};

export type ConnectedAccountsFlowMessage = {
  id: number;
  type: 'info' | 'error' | 'success';
  /** Already-translated. */
  text: string;
};

export type ConnectedAccountsViewProps = {
  /**
   * `sessionExpired` is the identity provider's own session having lapsed. It is deliberately
   * separate from `unavailable`: that one is a transient failure a retry can clear, and this one is
   * not — no number of retries mints a new identity-provider session, so the retry action is
   * withheld and the reason points at the sign-out card instead.
   */
  status: 'loading' | 'unavailable' | 'sessionExpired' | 'ready';
  /**
   * Already-translated reason the rows cannot be shown; set whenever `status` is `unavailable`
   * (FR-024) or `sessionExpired`.
   */
  unavailableReason?: string;
  onRetry: () => void;
  providers: ConnectedAccountsProviderRow[];
  credentials: ConnectedAccountsCredentialRow[];
  messages: ConnectedAccountsFlowMessage[];
  /**
   * Fires synchronously when a provider row's native form is about to submit — before the browser
   * navigates away. Must not call `preventDefault`; the form still POSTs natively (research D1).
   * Lets the consumer record what it expects to happen so it can announce the outcome itself if the
   * page comes back without a usable Kratos flow message (research D5 fallback).
   */
  onProviderActionSubmit?: (row: ConnectedAccountsProviderRow) => void;
};

/**
 * Connected Accounts section for the User Security tab (presentational, CRD).
 *
 * Every provider row is its own minimal native `<form action method>` with a
 * hidden CSRF node and a single submit button (`name="link"|"unlink"`,
 * `value=<providerId>`) — deliberately **not** rendered through
 * `CrdKratosFlow`, whose validation gate exempts only `name === "provider"`
 * submits (research D1). Password and passkey render as read-only state rows
 * that route to their existing sections — no add/change/remove action here
 * (FR-022).
 */
export function ConnectedAccountsView({
  status,
  unavailableReason,
  onRetry,
  providers,
  credentials,
  messages,
  onProviderActionSubmit,
}: ConnectedAccountsViewProps) {
  const { t } = useTranslation(NS);
  // Disconnecting a provider removes a sign-in method with no undo — a provider can later change how
  // it identifies someone, which can make the exact same connection unrecoverable — so CRD Golden
  // Rule 9 requires confirmation before it fires. `pendingDisconnect` holds the row awaiting
  // confirmation; `formRefs` lets `onConfirm` submit that row's own native form (`form.submit()`
  // deliberately bypasses the `submit` event/React's `onSubmit`, so it fires once, not twice, and
  // keeps the row's action a plain native POST to the flow's own action URL). Connecting (`link`) is
  // not destructive and is never routed through this — only `unlink` rows set `pendingDisconnect`.
  const [pendingDisconnect, setPendingDisconnect] = useState<ConnectedAccountsProviderRow | undefined>(undefined);
  const formRefs = useRef<Record<string, HTMLFormElement | null>>({});

  const handleDisconnectConfirm = () => {
    if (!pendingDisconnect) return;
    onProviderActionSubmit?.(pendingDisconnect);
    formRefs.current[pendingDisconnect.providerId]?.submit();
    setPendingDisconnect(undefined);
  };

  // This wrapper — and the live region inside it — stays mounted at the same tree position across
  // every `status` transition (loading → unavailable/ready), so screen readers observe it as one
  // persisting region whose children mutate rather than a freshly-inserted node that already carries
  // its final content. A live region only announces mutations that occur after it exists; a status
  // branch that returned a differently-typed root element per status would remount this on every
  // transition and silently drop the announcement of what just happened.
  return (
    <div className="flex flex-col gap-4">
      <div aria-live="polite" aria-atomic="true" className={messages.length > 0 ? 'flex flex-col gap-2' : undefined}>
        {status === 'ready' &&
          messages.map(message => (
            <FlowMessage key={`${message.id}-${message.text}`} type={message.type} text={message.text} />
          ))}
      </div>

      {status === 'loading' ? (
        <output aria-label={t('shared.loading')} className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </output>
      ) : status === 'sessionExpired' ? (
        // No retry button: the settings flow this section is derived from answers 401 for as long as
        // the identity-provider session stays lapsed, so a retry would re-run the same failing
        // request and land right back here. The way out is the sign-out action in the card below,
        // which this reason names. Styled as information rather than an alert for the same reason
        // the tab-level card is — nothing is broken, a session simply ended. `<output>` carries an
        // implicit `role="status"`, the polite counterpart to the `role="alert"` the unavailable
        // branch uses: the outcome of the load still has to reach assistive technology, but it does
        // not warrant interrupting. Spelled as the element rather than the ARIA attribute because
        // that is what the repo's a11y lint requires wherever a semantic equivalent exists.
        <output className="flex items-start gap-2 rounded-md border bg-muted/30 p-4 text-body text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{unavailableReason}</p>
        </output>
      ) : status === 'unavailable' ? (
        <div className="flex flex-col gap-3">
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-body text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{unavailableReason}</p>
          </div>
          <Button type="button" variant="outline" onClick={onRetry} className="self-start">
            {t('user.security.connectedAccounts.unavailable.retry')}
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {providers.map(provider => (
            <ProviderRow
              key={provider.providerId}
              row={provider}
              onActionSubmit={onProviderActionSubmit}
              onRequestDisconnect={setPendingDisconnect}
              formRef={el => {
                formRefs.current[provider.providerId] = el;
              }}
            />
          ))}
          {credentials.map(credential => (
            <CredentialRow key={credential.kind} row={credential} />
          ))}
        </ul>
      )}

      <ConfirmationDialog
        open={Boolean(pendingDisconnect)}
        onOpenChange={next => {
          if (!next) setPendingDisconnect(undefined);
        }}
        title={t('user.security.connectedAccounts.confirmDisconnect.title', {
          provider: pendingDisconnect?.displayName ?? '',
        })}
        description={t('user.security.connectedAccounts.confirmDisconnect.description', {
          provider: pendingDisconnect?.displayName ?? '',
        })}
        confirmLabel={t('user.security.connectedAccounts.confirmDisconnect.confirm')}
        onConfirm={handleDisconnectConfirm}
        variant="destructive"
      />
    </div>
  );
}

function FlowMessage({ type, text }: { type: 'info' | 'error' | 'success'; text: string }) {
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-body',
        type === 'error' && 'bg-destructive/10 text-destructive',
        type === 'success' && 'bg-secondary text-foreground',
        type === 'info' && 'border border-primary/15 bg-primary/5 text-primary'
      )}
    >
      <span>{text}</span>
    </div>
  );
}

function ProviderRow({
  row,
  onActionSubmit,
  onRequestDisconnect,
  formRef,
}: {
  row: ConnectedAccountsProviderRow;
  onActionSubmit?: (row: ConnectedAccountsProviderRow) => void;
  /** Opens the destructive-action confirmation for an `unlink` row instead of submitting directly. */
  onRequestDisconnect: (row: ConnectedAccountsProviderRow) => void;
  /** Registers this row's own form element so a confirmed disconnect can submit it natively. */
  formRef: (el: HTMLFormElement | null) => void;
}) {
  const { t } = useTranslation(NS);
  const stateLabel =
    row.state === 'not-connected'
      ? t('user.security.connectedAccounts.provider.notConnected')
      : t('user.security.connectedAccounts.provider.connected');
  const isLocked = row.state === 'connected-locked';
  const lockedReasonId = isLocked ? `connected-accounts-${row.providerId}-locked-reason` : undefined;

  return (
    <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {row.iconSrc ? (
          <img src={row.iconSrc} alt="" aria-hidden="true" className="size-6 shrink-0" />
        ) : (
          <Link2 aria-hidden="true" className="size-6 shrink-0 text-muted-foreground" />
        )}
        <div>
          <p className="text-body-emphasis">{row.displayName}</p>
          <p className="text-caption text-muted-foreground">{stateLabel}</p>
          {/* Names the reason a locked row's disconnect is blocked and the next
              step (add a password/passkey below) — FR-008. Visible on its own
              (not only via aria-describedby), so the distinction from a plain
              "connected" row is perceivable by any means, not colour alone
              (FR-009). */}
          {isLocked && row.lockedReason ? (
            <p id={lockedReasonId} className="mt-1 text-caption text-muted-foreground">
              {row.lockedReason}
            </p>
          ) : null}
        </div>
      </div>

      {row.action ? (
        <form
          ref={formRef}
          action={row.action.formAction}
          method={row.action.method}
          className="shrink-0"
          onSubmit={event => {
            if (row.action?.kind === 'unlink') {
              // Destructive — confirm first (CRD Golden Rule 9). The confirmed submit later goes
              // through `form.submit()` instead, which does not raise this event again.
              event.preventDefault();
              onRequestDisconnect(row);
              return;
            }
            onActionSubmit?.(row);
          }}
        >
          <input type="hidden" name={row.action.csrf.name} defaultValue={row.action.csrf.value} />
          {row.action.kind === 'unlink' ? (
            // The confirmed disconnect submits this form via `form.submit()`, which — per the HTML
            // form-submission algorithm — submits with no submitter, so the button below never
            // contributes its name/value pair to the entry list. Carrying the same pair here as a
            // hidden field keeps it in the submission regardless of how the form is submitted.
            <input type="hidden" name={row.action.submitName} defaultValue={row.action.submitValue} />
          ) : null}
          <Button
            type="submit"
            name={row.action.submitName}
            value={row.action.submitValue}
            variant={row.action.kind === 'link' ? 'default' : 'outline'}
            aria-label={t(
              row.action.kind === 'link'
                ? 'user.security.connectedAccounts.actions.connectAria'
                : 'user.security.connectedAccounts.actions.disconnectAria',
              { provider: row.displayName }
            )}
          >
            {t(
              row.action.kind === 'link'
                ? 'user.security.connectedAccounts.actions.connect'
                : 'user.security.connectedAccounts.actions.disconnect'
            )}
          </Button>
        </form>
      ) : isLocked ? (
        // Reachable-but-blocked (research D7): `aria-disabled`, never the
        // native `disabled` attribute — a truly disabled button drops out of
        // the tab order and out of a screen reader's forms-mode navigation,
        // which is exactly how FR-008's "cannot explain itself" failure mode
        // happens. This one stays focusable and its reason travels with it
        // via `aria-describedby`.
        <Button
          type="button"
          variant="outline"
          aria-disabled="true"
          aria-describedby={lockedReasonId}
          className="shrink-0 cursor-not-allowed opacity-50"
        >
          {t('user.security.connectedAccounts.actions.disconnect')}
        </Button>
      ) : null}
    </li>
  );
}

function CredentialRow({ row }: { row: ConnectedAccountsCredentialRow }) {
  const { t } = useTranslation(NS);
  const Icon = row.kind === 'password' ? ShieldCheck : KeyRound;
  const label = t(`user.security.connectedAccounts.credentials.${row.kind}.label`);
  const stateLabel = t(`user.security.connectedAccounts.credentials.${row.kind}.${row.present ? 'set' : 'notSet'}`);
  const manageLabel = t(`user.security.connectedAccounts.credentials.${row.kind}.manage`);

  return (
    <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Icon aria-hidden="true" className="size-6 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-body-emphasis">{label}</p>
          <p className="text-caption text-muted-foreground">{stateLabel}</p>
        </div>
      </div>
      <a href={row.manageHref} className="text-body-emphasis shrink-0 underline">
        {manageLabel}
      </a>
    </li>
  );
}
