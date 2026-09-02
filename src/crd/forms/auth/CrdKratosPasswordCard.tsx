import { Info } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { ConfirmPasswordField } from '@/crd/forms/ConfirmPasswordField';
import { FloatingField } from '@/crd/forms/FloatingField';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

/**
 * Plain-TypeScript projection of the password slice of a Kratos Settings flow.
 * Produced by the integration layer (`flowDescriptorAdapter`); deliberately free
 * of `@ory/kratos-client` types so this component carries no MUI / Apollo / domain
 * coupling.
 */
export type CrdKratosPasswordFlow = {
  /** Native form action URL (`flow.ui.action`). */
  action: string;
  method: 'POST' | 'GET';
  /** Hidden inputs (CSRF token et al.) — emitted verbatim into the form POST. */
  hidden: ReadonlyArray<{ name: string; value: string }>;
  /** The single `password` input node. */
  passwordField: {
    name: string;
    label: string;
    value: string;
    disabled: boolean;
    autocomplete?: string;
    errorMessage?: string;
  };
  /** The `password`-method submit button. */
  submit: {
    name: string;
    value: string;
    label: string;
    disabled: boolean;
  };
  /** Flow-level messages (server-side validation, success notices). */
  messages: ReadonlyArray<{ id: number; type: 'info' | 'error' | 'success'; text: string }>;
};

export type CrdKratosPasswordCardProps = {
  flow: CrdKratosPasswordFlow;
  /** Label for the (client-only) confirm-password field. */
  confirmLabel: string;
  /** Shown inline on the confirm field when the two passwords differ. */
  mismatchMessage: string;
  /** Accessible label for the show/hide toggle when the value is hidden. */
  showPasswordLabel: string;
  /** Accessible label for the show/hide toggle when the value is visible. */
  hidePasswordLabel: string;
};

/**
 * Password-change card for the User Security tab — the MUI-free replacement for
 * the `KratosForm` + `KratosUI` + `KratosConfirmPasswordField` mount.
 *
 * Renders a native `<form action method>` that POSTs straight to Kratos:
 *   - every hidden node (CSRF token) is emitted verbatim;
 *   - the `password` input carries the field's real `name`, so its value is
 *     serialised into the POST;
 *   - the submit button carries the method node's `name`/`value`
 *     (`name="method"`, `value="password"`), which is what Kratos keys the
 *     password method on.
 *
 * Kratos runs its own password policies server-side (min length, breached-
 * password HIBP, identifier similarity); failures come back as flow messages.
 * On top of that, a client-only confirm-password field guards against typos:
 *   - confirm must equal the password;
 *   - submit is disabled while either field is empty or they mismatch;
 *   - on submit a mismatch `preventDefault()`s the POST and surfaces an inline
 *     error.
 * The confirm field has no `name`, so it is never serialised into the POST.
 */
export function CrdKratosPasswordCard({
  flow,
  confirmLabel,
  mismatchMessage,
  showPasswordLabel,
  hidePasswordLabel,
}: CrdKratosPasswordCardProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMismatch, setShowMismatch] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const submitDisabled = password.length === 0 || confirmPassword.length === 0 || mismatch || flow.submit.disabled;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (password !== confirmPassword) {
      event.preventDefault();
      event.stopPropagation();
      setShowMismatch(true);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (showMismatch) setShowMismatch(false);
  };

  const handleConfirmChange = (value: string) => {
    setConfirmPassword(value);
    if (showMismatch) setShowMismatch(false);
  };

  const confirmError = (showMismatch || mismatch) && confirmPassword.length > 0 ? mismatchMessage : undefined;

  return (
    <form
      action={flow.action}
      method={flow.method}
      noValidate={true}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {flow.hidden.map(node => (
        <input key={node.name} type="hidden" name={node.name} defaultValue={node.value} />
      ))}

      {flow.messages.length > 0 ? (
        <div className="flex flex-col gap-2">
          {flow.messages.map(message => (
            <Message key={`${message.id}-${message.text}`} type={message.type} text={message.text} />
          ))}
        </div>
      ) : null}

      <FloatingField
        name={flow.passwordField.name}
        label={flow.passwordField.label}
        type="password"
        defaultValue={flow.passwordField.value || undefined}
        required={true}
        disabled={flow.passwordField.disabled}
        autoComplete={flow.passwordField.autocomplete ?? 'new-password'}
        errorMessage={flow.passwordField.errorMessage}
        showPasswordLabel={showPasswordLabel}
        hidePasswordLabel={hidePasswordLabel}
        onValueChange={handlePasswordChange}
      />

      <ConfirmPasswordField
        value={confirmPassword}
        onChange={handleConfirmChange}
        label={confirmLabel}
        errorMessage={confirmError}
        autoComplete="new-password"
        showPasswordLabel={showPasswordLabel}
        hidePasswordLabel={hidePasswordLabel}
      />

      <Button
        type="submit"
        name={flow.submit.name}
        value={flow.submit.value}
        disabled={submitDisabled}
        className="text-control h-12 w-full font-semibold uppercase tracking-wider"
      >
        {flow.submit.label}
      </Button>
    </form>
  );
}

function Message({ type, text }: { type: 'info' | 'error' | 'success'; text: string }) {
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
      {type === 'info' ? <Info aria-hidden="true" className="size-4 shrink-0" /> : null}
      <span>{text}</span>
    </div>
  );
}
