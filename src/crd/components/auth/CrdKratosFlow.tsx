import { Info, KeyRound } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  KratosFlowDescriptor,
  KratosPasskeyTrigger,
  KratosTextInputNode,
} from '@/crd/components/auth/flowDescriptor';
import { OrContinueWithDivider } from '@/crd/components/auth/OrContinueWithDivider';
import { SocialProviderButton } from '@/crd/components/auth/SocialProviderButton';
import { FloatingField } from '@/crd/forms/FloatingField';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type CrdKratosFlowProps = {
  descriptor: KratosFlowDescriptor;
  /** Slot rendered before the input fields (e.g. an accept-terms checkbox). */
  beforeInputs?: ReactNode;
  /** Slot rendered after the password fields (e.g. the "Forgot password?" link). */
  resetPasswordElement?: ReactNode;
  /** Slot rendered just before the submit button(s). */
  children?: ReactNode;
  submitDisabled?: boolean;
  disableInputs?: boolean;
  /** Overrides the submit button label (e.g. the recovery resend cooldown countdown). */
  submitLabelOverride?: (label: string) => ReactNode;
  /** Fired on a native form submit, after the HTML5 validity gate passes. Consumers
   *  use it for side effects like starting the recovery resend cooldown. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Fired when an OIDC provider button is activated (for analytics). */
  onProviderClick?: (providerKey: string) => void;
  /** Fired when a passkey button is activated — the consumer runs the WebAuthn ceremony. */
  onPasskeyTrigger?: (trigger: KratosPasskeyTrigger) => void;
};

const EMAIL_FIELD_NAMES = new Set(['identifier', 'password_identifier', 'traits.email']);

/**
 * Renders a Kratos authentication flow as a native form, reproducing the
 * prototype `AuthPage` layout and the MUI `KratosUI` node grouping. Pure
 * presentational — the form POSTs straight to `descriptor.action`; Kratos
 * owns the submission.
 */
export function CrdKratosFlow({
  descriptor,
  beforeInputs,
  resetPasswordElement,
  children,
  submitDisabled,
  disableInputs,
  submitLabelOverride,
  onSubmit,
  onProviderClick,
  onPasskeyTrigger,
}: CrdKratosFlowProps) {
  const { t } = useTranslation('crd-auth');
  const { groups } = descriptor;

  // Track live values for required inputs to disable the submit button until
  // every required field is filled. The form itself stays uncontrolled — these
  // values are only used for the submit-disabled check.
  const requiredInputs = [...groups.default, ...groups.password, ...groups.rest].filter(node => node.required);
  const [requiredValues, setRequiredValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(requiredInputs.map(node => [node.name, node.value || '']))
  );
  const allRequiredFilled = requiredInputs.every(node => (requiredValues[node.name] ?? '').trim().length > 0);
  const trackValue = (name: string) => (value: string) => {
    setRequiredValues(previous => ({ ...previous, [name]: value }));
  };
  // The primary form-submit (non-OIDC/passkey) is blocked until every required
  // input is filled; OIDC and passkey paths bypass the form's required values
  // (the provider supplies those traits server-side). They are still blocked by
  // `submitDisabled` — for registration that captures the accept-terms gate, so
  // clicking Microsoft can't submit an unchecked-terms form which Kratos would
  // otherwise reject as a no-op flow re-render.
  const formSubmitDisabled = submitDisabled || !allRequiredFilled;
  const alternativeSubmitDisabled = !!submitDisabled;

  const fieldLabel = (node: KratosTextInputNode): string => {
    if (EMAIL_FIELD_NAMES.has(node.name)) return t('fields.email');
    if (node.name === 'password') return t('fields.password');
    if (node.name === 'traits.name.first') return t('fields.firstName');
    if (node.name === 'traits.name.last') return t('fields.lastName');
    return node.label;
  };

  const renderInput = (node: KratosTextInputNode) => {
    // Treat a field as email if EITHER Kratos says so (`node.type === 'email'`)
    // OR its name is a known email field (`identifier`, `password_identifier`,
    // `traits.email`). The OR matters because Kratos sometimes ships these
    // fields as `type="text"`, so a name-only or type-only check would miss
    // the format validation in those flows.
    const isEmailField = node.type === 'email' || EMAIL_FIELD_NAMES.has(node.name);
    return (
      <FloatingField
        key={node.name}
        name={node.name}
        label={fieldLabel(node)}
        // Force the input to `type="email"` so both the inline blur check and
        // the on-submit `checkValidity` catch a malformed address — even when
        // Kratos reports the field as plain text.
        type={isEmailField ? 'email' : node.type}
        defaultValue={node.value || undefined}
        required={node.required}
        disabled={disableInputs || node.disabled}
        autoComplete={node.autocomplete}
        errorMessage={node.messages.find(message => message.type === 'error')?.text}
        showPasswordLabel={node.type === 'password' ? t('fields.showPassword') : undefined}
        hidePasswordLabel={node.type === 'password' ? t('fields.hidePassword') : undefined}
        invalidEmailMessage={isEmailField ? t('fields.invalidEmail') : undefined}
        onValueChange={node.required ? trackValue(node.name) : undefined}
      />
    );
  };

  const hasAlternativeMethods = groups.passkey.length > 0 || groups.oidc.length > 0;

  // The form is `noValidate` so the OIDC submit buttons aren't blocked by native
  // required-field validation (an empty/invalid email must not stop someone
  // starting a social login). But the primary submits — Sign in, the
  // registration "Next", the recovery request — still run HTML5 validation here,
  // which is what catches a malformed email (e.g. "zamunda") client-side before
  // the POST instead of letting it bounce off Kratos. Everything except the OIDC
  // provider button (`name="provider"`) and the "Back" button (`value` ends in
  // `:back`) is gated; passkey buttons are `type="button"` and never reach this.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const isProviderSubmit = submitter?.name === 'provider';
    const isBackSubmit = (submitter?.value ?? '').includes(':back');
    if (!isProviderSubmit && !isBackSubmit && !event.currentTarget.checkValidity()) {
      event.preventDefault();
      event.currentTarget.reportValidity();
      return;
    }
    onSubmit?.(event);
  };

  // `noValidate` on the form — the OIDC / passkey buttons are submit buttons
  // inside it; without it the browser's native `required`-field validation
  // blocks their submit and focuses the empty email field instead of starting
  // the provider flow. Kratos validates the password flow server-side. Mirrors
  // the MUI `KratosForm` (also `noValidate`).
  return (
    <form
      action={descriptor.action}
      method={descriptor.method}
      noValidate={true}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {groups.hidden.map(node => (
        <input key={node.name} type="hidden" name={node.name} defaultValue={node.value} />
      ))}

      {descriptor.messages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {descriptor.messages.map(message => (
            <div
              key={`${message.id}-${message.text}`}
              role={message.type === 'error' ? 'alert' : 'status'}
              className={cn(
                'flex gap-3 rounded-md px-3 py-2.5 text-body',
                // Rich (multi-line) content aligns the icon to the top; plain
                // single-line text stays vertically centred with the icon.
                message.content ? 'items-start' : 'items-center',
                message.type === 'error' && 'bg-destructive/10 text-destructive',
                message.type === 'success' && 'bg-secondary text-foreground',
                message.type === 'info' && 'border border-primary/15 bg-primary/5 text-primary'
              )}
            >
              {message.type === 'info' ? (
                <Info aria-hidden="true" className={cn('size-4 shrink-0', message.content && 'mt-0.5')} />
              ) : null}
              {message.content ? (
                <div className="[&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold">{message.content}</div>
              ) : (
                <span>{message.text}</span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {beforeInputs}
      {groups.default.map(renderInput)}
      {groups.password.map(renderInput)}
      {resetPasswordElement}
      {groups.rest.map(renderInput)}
      {children}

      {groups.submit.map(node => (
        <Button
          key={`${node.name}-${node.value}`}
          type="submit"
          name={node.name}
          value={node.value}
          disabled={formSubmitDisabled || disableInputs || node.disabled}
          className="text-control h-12 w-full font-semibold uppercase tracking-wider"
        >
          {submitLabelOverride ? submitLabelOverride(node.label) : node.label}
        </Button>
      ))}

      {groups.anchors.map(anchor => (
        <Button
          key={anchor.href}
          asChild={true}
          className="text-control h-12 w-full font-semibold uppercase tracking-wider"
        >
          <a href={anchor.href}>{anchor.label}</a>
        </Button>
      ))}

      {hasAlternativeMethods && (groups.submit.length > 0 || groups.anchors.length > 0) ? (
        <OrContinueWithDivider label={t('continueWith')} />
      ) : null}

      {/* Hidden inputs that mirror each passkey trigger node. Kratos's passkey
          flow expects an input with the same `name` as the trigger button to be
          present in the form — the Ory passkey script populates that input's
          value with the WebAuthn credential before submission. Without these,
          a successful ceremony has nowhere to deposit its output and the form
          POST is missing the passkey payload. */}
      {groups.passkey.map(node => (
        <input key={`passkey-hidden-${node.name}-${node.value}`} type="hidden" name={node.name} />
      ))}

      {hasAlternativeMethods ? (
        <div className="flex items-center justify-center gap-3">
          {groups.passkey.map(node => (
            <SocialProviderButton
              key={`passkey-${node.name}-${node.value}`}
              label={node.label || t('providers.fallback')}
              icon={<KeyRound aria-hidden="true" className="size-5" />}
              disabled={alternativeSubmitDisabled || disableInputs || node.disabled}
              onClick={() => onPasskeyTrigger?.(node.trigger)}
            />
          ))}
          {groups.oidc.map(node => {
            // Brand-cased name from the `crd-auth` namespace (e.g. "GitHub")
            // — Kratos sends provider keys lower-cased, and the prototype's
            // node label is the lower-cased key too. Falls back to the
            // Kratos-supplied label, then to the generic "Other provider".
            const brand = t(`providers.${node.value}` as 'providers.fallback', {
              defaultValue: node.label || node.customisation?.providerKey || '',
            });
            const tooltip = brand || t('providers.fallback');
            return (
              <SocialProviderButton
                key={`oidc-${node.value}`}
                label={tooltip}
                ariaLabel={t('providers.connectWith', { provider: tooltip })}
                iconSrc={node.customisation?.iconSrc}
                formFieldName={node.name}
                formFieldValue={node.value}
                disabled={alternativeSubmitDisabled || disableInputs || node.disabled}
                onClick={() => onProviderClick?.(node.value)}
              />
            );
          })}
        </div>
      ) : null}
    </form>
  );
}
