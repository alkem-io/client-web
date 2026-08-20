import { AlertCircle, KeyRound, Link2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  status: 'loading' | 'unavailable' | 'ready';
  /** Already-translated; set only when `status === 'unavailable'` (FR-024). */
  unavailableReason?: string;
  onRetry: () => void;
  providers: ConnectedAccountsProviderRow[];
  credentials: ConnectedAccountsCredentialRow[];
  messages: ConnectedAccountsFlowMessage[];
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
}: ConnectedAccountsViewProps) {
  const { t } = useTranslation(NS);

  if (status === 'loading') {
    return (
      <output aria-label={t('shared.loading')} className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </output>
    );
  }

  if (status === 'unavailable') {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {messages.map(message => (
            <FlowMessage key={`${message.id}-${message.text}`} type={message.type} text={message.text} />
          ))}
        </div>
      ) : null}

      <ul className="divide-y divide-border">
        {providers.map(provider => (
          <ProviderRow key={provider.providerId} row={provider} />
        ))}
        {credentials.map(credential => (
          <CredentialRow key={credential.kind} row={credential} />
        ))}
      </ul>
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

function ProviderRow({ row }: { row: ConnectedAccountsProviderRow }) {
  const { t } = useTranslation(NS);
  const stateLabel =
    row.state === 'not-connected'
      ? t('user.security.connectedAccounts.provider.notConnected')
      : t('user.security.connectedAccounts.provider.connected');

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
        </div>
      </div>

      {row.action ? (
        <form action={row.action.formAction} method={row.action.method} className="shrink-0">
          <input type="hidden" name={row.action.csrf.name} defaultValue={row.action.csrf.value} />
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
