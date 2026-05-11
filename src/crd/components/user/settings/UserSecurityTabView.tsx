import { Info, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsCard } from '@/crd/components/contributor/settings/SettingsCard';
import { Skeleton } from '@/crd/primitives/skeleton';

const NS = 'crd-contributorSettings';

export type UserSecurityViewState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'noWebauthn' }
  | { kind: 'ready' };

export type UserSecurityTabViewProps = {
  state: UserSecurityViewState;
  /**
   * Slot for the rendered Kratos UI (the legacy `<KratosForm><KratosUI /></KratosForm>`
   * mount). Provided by the integration page so the CRD view stays free of
   * direct MUI / Kratos imports. Only rendered when `state.kind === 'ready'`.
   */
  kratosForm: ReactNode;
};

/**
 * User Security tab — presentational chrome only. The CRD layer wraps the
 * Kratos passkey/WebAuthn form in a `SettingsCard` (heading + description
 * + body slot); the form fields themselves are NOT restyled (FR-080 — out
 * of scope for this spec).
 *
 * Four render states (driven by `useIdentityProviderSettingsFlow`):
 * - `loading` — full-card skeleton.
 * - `error` — Settings card with an error message.
 * - `noWebauthn` — Settings card with an info alert ("WebAuthn / Passkey
 *   is not enabled on this account").
 * - `ready` — Settings card containing the slot-mounted Kratos form.
 */
export function UserSecurityTabView({ state, kratosForm }: UserSecurityTabViewProps) {
  const { t } = useTranslation(NS);

  if (state.kind === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (state.kind === 'error') {
    return (
      <SettingsCard icon={ShieldAlert} title={t('user.security.title')}>
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-body text-destructive">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{t('user.security.errorDescription')}</p>
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard icon={ShieldCheck} title={t('user.security.title')} description={t('user.security.description')}>
      {state.kind === 'noWebauthn' ? (
        <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-4 text-body text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{t('user.security.notEnabled')}</p>
        </div>
      ) : (
        <div className="mt-2">{kratosForm}</div>
      )}
    </SettingsCard>
  );
}
