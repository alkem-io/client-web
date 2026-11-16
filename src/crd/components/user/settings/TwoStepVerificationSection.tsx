import { Copy, Download, Info, KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';

const CODES_LIST_CLASS = 'grid grid-cols-2 gap-1 rounded-md border border-border bg-muted/40 p-3 font-mono text-body';

const NS = 'crd-contributorSettings';

export type TwoStepAuthenticator =
  | { kind: 'enrolled' }
  | {
      kind: 'available';
      qr?: { src: string; alt: string; width?: number; height?: number };
      secret?: string;
      codeError?: string;
    }
  | { kind: 'unavailable' };

export type TwoStepRecoveryCodes =
  | { kind: 'none' }
  /** Generated and shown once; they count only after the person confirms they saved them. */
  | { kind: 'unconfirmed'; codes: string[] }
  | { kind: 'confirmed' }
  /** Recovery codes need an authenticator or a security key first. */
  | { kind: 'disabled' }
  | { kind: 'unavailable' };

export type TwoStepSecurityKeys = {
  keys: { id: string; name: string }[];
  /**
   * The registration form, submitted natively by the identity provider's
   * script once the ceremony has written its result into `resultFieldName`:
   * `action` and `hiddenFields` (anti-CSRF token, the result input) come from
   * the flow, and the trigger carries the ceremony options as its value. A
   * submission without a result (the Add button, Enter in the name field)
   * starts the ceremony instead.
   */
  registration?: {
    action: string;
    hiddenFields: { name: string; value: string }[];
    resultFieldName: string;
    nameFieldName: string;
    /** Why the identity provider refused the last registration's name, already translated by the consumer. */
    nameError?: string;
    trigger: { name: string; value: string };
  };
};

export type TwoStepVerificationSectionProps = {
  authenticator: TwoStepAuthenticator;
  recoveryCodes: TwoStepRecoveryCodes;
  securityKeys?: TwoStepSecurityKeys;
  /** Outcome messages of the last submission, already translated by the consumer. */
  messages?: { type: 'info' | 'error' | 'success'; text: string }[];
  /** Removing a factor leaves none while a rule requires one: the removal warns that the rule applies again. */
  warnOnLastFactor?: boolean;
  onConfirmAuthenticator: (code: string) => void;
  onRemoveAuthenticator: () => void;
  onGenerateRecoveryCodes: () => void;
  onConfirmRecoveryCodes: () => void;
  /** Copies the shown codes; absent when the browser offers no clipboard. Settles with the copy's outcome. */
  onCopyRecoveryCodes?: (codes: string[]) => Promise<void>;
  /** Saves the shown codes as a file. */
  onDownloadRecoveryCodes: (codes: string[]) => void;
  onRemoveRecoveryCodes: () => void;
  onAddSecurityKey: (triggerValue: string) => void;
  onRemoveSecurityKey: (id: string) => void;
};

type PendingRemoval =
  | { kind: 'authenticator' }
  | { kind: 'securityKey'; id: string; name: string }
  | { kind: 'recoveryCodes' }
  | { kind: 'regenerate' };

const Explanation = ({ children }: { children: string }) => (
  <p className="text-body text-muted-foreground">{children}</p>
);

const Block = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <section className="flex flex-col gap-3 rounded-lg border border-border p-4">
    <h3 className="flex items-center gap-2 text-subheader font-semibold">
      {icon}
      {title}
    </h3>
    {children}
  </section>
);

/**
 * Two-step verification: the authenticator app, security keys and recovery
 * codes of the signed-in person. Presentational — every action is a callback;
 * the security-key registration is the one native form, because the identity
 * provider's script submits it.
 */
export function TwoStepVerificationSection({
  authenticator,
  recoveryCodes,
  securityKeys,
  messages = [],
  warnOnLastFactor = false,
  onConfirmAuthenticator,
  onRemoveAuthenticator,
  onGenerateRecoveryCodes,
  onConfirmRecoveryCodes,
  onCopyRecoveryCodes,
  onDownloadRecoveryCodes,
  onRemoveRecoveryCodes,
  onAddSecurityKey,
  onRemoveSecurityKey,
}: TwoStepVerificationSectionProps) {
  const { t } = useTranslation(NS);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval>();
  // The outcome belongs to the code set it copied: a regenerated set starts uncopied.
  const [copied, setCopied] = useState<{ codes: string; outcome: 'copied' | 'failed' }>();

  const keys = securityKeys?.keys ?? [];
  const registration = securityKeys?.registration;

  const confirmCopy = (removal: PendingRemoval) => {
    const warning = warnOnLastFactor ? ` ${t('user.security.twoStep.lastFactorWarning')}` : '';
    switch (removal.kind) {
      case 'authenticator':
        return {
          title: t('user.security.twoStep.authenticator.removeTitle'),
          description: `${t('user.security.twoStep.authenticator.removeDescription')}${warning}`,
          confirmLabel: t('user.security.twoStep.remove'),
        };
      case 'securityKey':
        return {
          title: t('user.security.twoStep.securityKeys.removeTitle', { name: removal.name }),
          description: `${t('user.security.twoStep.securityKeys.removeDescription')}${warning}`,
          confirmLabel: t('user.security.twoStep.remove'),
        };
      case 'recoveryCodes':
        return {
          title: t('user.security.twoStep.recoveryCodes.removeTitle'),
          description: `${t('user.security.twoStep.recoveryCodes.removeDescription')}${warning}`,
          confirmLabel: t('user.security.twoStep.recoveryCodes.remove'),
        };
      case 'regenerate':
        return {
          title: t('user.security.twoStep.recoveryCodes.regenerateTitle'),
          description: t('user.security.twoStep.recoveryCodes.regenerateDescription'),
          confirmLabel: t('user.security.twoStep.recoveryCodes.regenerate'),
        };
    }
  };

  const runRemoval = (removal: PendingRemoval) => {
    if (removal.kind === 'authenticator') onRemoveAuthenticator();
    else if (removal.kind === 'securityKey') onRemoveSecurityKey(removal.id);
    else if (removal.kind === 'recoveryCodes') onRemoveRecoveryCodes();
    else onGenerateRecoveryCodes();
  };

  const handleConfirmAuthenticator = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get('code') ?? '').trim();
    if (code) onConfirmAuthenticator(code);
  };

  const handleRegistrationSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!registration || new FormData(event.currentTarget).get(registration.resultFieldName)) return;
    event.preventDefault();
    onAddSecurityKey(registration.trigger.value);
  };

  const copyCodes = (codes: string[]) => {
    const key = codes.join('\n');
    onCopyRecoveryCodes?.(codes).then(
      () => setCopied({ codes: key, outcome: 'copied' }),
      () => setCopied({ codes: key, outcome: 'failed' })
    );
  };

  const renderCodes = (codes: string[]) => {
    const copyOutcome = copied?.codes === codes.join('\n') ? copied.outcome : undefined;
    return (
      <div className="flex flex-col gap-2">
        {/* biome-ignore lint/a11y/useSemanticElements lint/a11y/noRedundantRoles: role="list" restores semantics after Tailwind reset */}
        <ul role="list" className={CODES_LIST_CLASS}>
          {codes.map(code => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!onCopyRecoveryCodes}
            onClick={() => copyCodes(codes)}
          >
            <Copy aria-hidden="true" className="size-4" />
            {copyOutcome === 'copied'
              ? t('user.security.twoStep.recoveryCodes.copied')
              : t('user.security.twoStep.recoveryCodes.copy')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onDownloadRecoveryCodes(codes)}>
            <Download aria-hidden="true" className="size-4" />
            {t('user.security.twoStep.recoveryCodes.download')}
          </Button>
        </div>
        {copyOutcome === 'failed' ? (
          <p role="alert" className="text-caption text-destructive">
            {t('user.security.twoStep.recoveryCodes.copyFailed')}
          </p>
        ) : null}
      </div>
    );
  };

  const pending = pendingRemoval ? confirmCopy(pendingRemoval) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <Explanation>{t('user.security.twoStep.description')}</Explanation>
      <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-body text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>{t('user.security.twoStep.neverShare')}</p>
      </div>

      {messages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {messages.map(message => (
            <p
              key={`${message.type}-${message.text}`}
              role={message.type === 'error' ? 'alert' : 'status'}
              className={cn(
                'rounded-md px-3 py-2.5 text-body',
                message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-foreground'
              )}
            >
              {message.text}
            </p>
          ))}
        </div>
      ) : null}

      {authenticator.kind !== 'unavailable' ? (
        <Block
          title={t('user.security.twoStep.authenticator.title')}
          icon={<Smartphone aria-hidden="true" className="size-4" />}
        >
          <Explanation>{t('user.security.twoStep.authenticator.explanation')}</Explanation>
          {authenticator.kind === 'enrolled' ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-body-emphasis">
                <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
                {t('user.security.twoStep.authenticator.active')}
              </p>
              <Button type="button" variant="outline" onClick={() => setPendingRemoval({ kind: 'authenticator' })}>
                {t('user.security.twoStep.remove')}
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={handleConfirmAuthenticator}>
              <p className="text-body-emphasis">{t('user.security.twoStep.authenticator.setUp')}</p>
              {authenticator.qr ? (
                <img
                  src={authenticator.qr.src}
                  alt={t('user.security.twoStep.authenticator.qrAlt')}
                  width={authenticator.qr.width}
                  height={authenticator.qr.height}
                  className="size-48 self-start"
                />
              ) : null}
              {authenticator.secret ? (
                <p className="text-body">
                  {t('user.security.twoStep.authenticator.secretLabel')}{' '}
                  <span className="break-all font-mono">{authenticator.secret}</span>
                </p>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="two-step-authenticator-code">
                  {t('user.security.twoStep.authenticator.codeLabel')}
                </Label>
                <Input
                  id="two-step-authenticator-code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required={true}
                  aria-invalid={authenticator.codeError ? true : undefined}
                  aria-describedby={authenticator.codeError ? 'two-step-authenticator-code-error' : undefined}
                  className="max-w-48"
                />
                {authenticator.codeError ? (
                  <p id="two-step-authenticator-code-error" className="text-caption text-destructive">
                    {authenticator.codeError}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="self-start">
                {t('user.security.twoStep.authenticator.confirm')}
              </Button>
            </form>
          )}
        </Block>
      ) : null}

      {securityKeys ? (
        <Block
          title={t('user.security.twoStep.securityKeys.title')}
          icon={<KeyRound aria-hidden="true" className="size-4" />}
        >
          <Explanation>{t('user.security.twoStep.securityKeys.explanation')}</Explanation>
          {keys.length > 0 ? (
            // biome-ignore lint/a11y/useSemanticElements lint/a11y/noRedundantRoles: role="list" restores semantics after Tailwind reset
            <ul role="list" className="flex flex-col divide-y divide-border rounded-md border border-border">
              {keys.map(key => (
                <li key={key.id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="text-body-emphasis">{key.name}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={t('user.security.twoStep.securityKeys.removeNamed', { name: key.name })}
                    onClick={() => setPendingRemoval({ kind: 'securityKey', id: key.id, name: key.name })}
                  >
                    {t('user.security.twoStep.remove')}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-muted-foreground">{t('user.security.twoStep.securityKeys.empty')}</p>
          )}
          {registration ? (
            <form
              action={registration.action}
              method="POST"
              className="flex flex-col gap-3"
              onSubmit={handleRegistrationSubmit}
            >
              {registration.hiddenFields.map(field => (
                <input key={field.name} type="hidden" name={field.name} defaultValue={field.value} />
              ))}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="two-step-security-key-name">{t('user.security.twoStep.securityKeys.nameLabel')}</Label>
                <Input
                  id="two-step-security-key-name"
                  name={registration.nameFieldName}
                  required={true}
                  aria-invalid={registration.nameError ? true : undefined}
                  aria-describedby={registration.nameError ? 'two-step-security-key-name-error' : undefined}
                  className="max-w-80"
                />
                {registration.nameError ? (
                  <p id="two-step-security-key-name-error" className="text-caption text-destructive">
                    {registration.nameError}
                  </p>
                ) : null}
              </div>
              <Button
                type="submit"
                variant="outline"
                className="self-start"
                name={registration.trigger.name}
                value={registration.trigger.value}
              >
                <KeyRound aria-hidden="true" className="size-4" />
                {t('user.security.twoStep.securityKeys.add')}
              </Button>
            </form>
          ) : null}
        </Block>
      ) : null}

      {recoveryCodes.kind !== 'unavailable' ? (
        <Block
          title={t('user.security.twoStep.recoveryCodes.title')}
          icon={<ShieldCheck aria-hidden="true" className="size-4" />}
        >
          <Explanation>{t('user.security.twoStep.recoveryCodes.explanation')}</Explanation>
          {recoveryCodes.kind === 'disabled' ? (
            <>
              <p className="text-body text-muted-foreground">{t('user.security.twoStep.recoveryCodes.needsFactor')}</p>
              <Button type="button" className="self-start" disabled={true}>
                {t('user.security.twoStep.recoveryCodes.generate')}
              </Button>
            </>
          ) : null}
          {recoveryCodes.kind === 'none' ? (
            <Button type="button" className="self-start" onClick={onGenerateRecoveryCodes}>
              {t('user.security.twoStep.recoveryCodes.generate')}
            </Button>
          ) : null}
          {recoveryCodes.kind === 'unconfirmed' ? (
            <>
              <output className="block text-body-emphasis text-destructive">
                {t('user.security.twoStep.recoveryCodes.shownOnce')}
              </output>
              {renderCodes(recoveryCodes.codes)}
              <Button type="button" className="self-start" onClick={onConfirmRecoveryCodes}>
                {t('user.security.twoStep.recoveryCodes.confirm')}
              </Button>
            </>
          ) : null}
          {recoveryCodes.kind === 'confirmed' ? (
            <>
              <p className="flex items-center gap-2 text-body-emphasis">
                <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
                {t('user.security.twoStep.recoveryCodes.active')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setPendingRemoval({ kind: 'regenerate' })}>
                  {t('user.security.twoStep.recoveryCodes.regenerate')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setPendingRemoval({ kind: 'recoveryCodes' })}>
                  {t('user.security.twoStep.recoveryCodes.remove')}
                </Button>
              </div>
            </>
          ) : null}
        </Block>
      ) : null}

      {pendingRemoval && pending ? (
        <ConfirmationDialog
          open={true}
          onOpenChange={open => {
            if (!open) setPendingRemoval(undefined);
          }}
          variant="destructive"
          title={pending.title}
          description={pending.description}
          confirmLabel={pending.confirmLabel}
          onConfirm={() => {
            runRemoval(pendingRemoval);
            setPendingRemoval(undefined);
          }}
        />
      ) : null}
    </div>
  );
}
