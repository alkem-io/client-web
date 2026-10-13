import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor, KratosPasskeyTrigger } from '@/crd/components/auth/flowDescriptor';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type LoginCardNotice = {
  /** Already-translated notice text (e.g. the account-lockout explanation). */
  text: string;
  /** Already-translated label for the action that re-enters sign-in. */
  actionLabel: string;
  actionHref: string;
  /**
   * `'destructive'` (the default) announces assertively — sign-in failed or is
   * blocked. `'info'` is for a notice that is part of the happy path, where red
   * text in an assertive live region would misreport a normal prompt as an error.
   */
  tone?: 'info' | 'destructive';
};

export type LoginCardProps = {
  /** The adapted login flow. While `undefined` (or `isLoading`), a centered loading state renders. */
  descriptor?: KratosFlowDescriptor;
  signUpHref: string;
  forgotPasswordHref: string;
  isLoading?: boolean;
  /**
   * Renders the card as a message + action instead of the sign-in form or the
   * loading state — used when sign-in cannot proceed right now (e.g. the
   * account-lockout backoff) and no interactive Kratos form may be offered.
   */
  notice?: LoginCardNotice;
  onProviderClick?: (providerKey: string) => void;
  onPasskeyTrigger?: (trigger: KratosPasskeyTrigger) => void;
};

export function LoginCard({
  descriptor,
  signUpHref,
  forgotPasswordHref,
  isLoading,
  notice,
  onProviderClick,
  onPasskeyTrigger,
}: LoginCardProps) {
  const { t } = useTranslation('crd-auth');

  if (notice) {
    return (
      <AuthCard
        title={t('signIn.title')}
        header={
          <AuthCardHeader
            contextLabel={t('signIn.noAccount')}
            contextLinkLabel={t('signIn.signUp')}
            contextLinkHref={signUpHref}
          />
        }
      >
        <div className="flex flex-col gap-5">
          <div
            role={notice.tone === 'info' ? 'status' : 'alert'}
            className={cn(
              'text-body rounded-md px-3 py-2.5',
              notice.tone === 'info' ? 'bg-muted text-muted-foreground' : 'bg-destructive/10 text-destructive'
            )}
          >
            {notice.text}
          </div>
          <Button asChild={true} className="text-control h-12 w-full font-semibold uppercase tracking-wider">
            <a href={notice.actionHref}>{notice.actionLabel}</a>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t('signIn.title')}
      header={
        <AuthCardHeader
          contextLabel={t('signIn.noAccount')}
          contextLinkLabel={t('signIn.signUp')}
          contextLinkHref={signUpHref}
        />
      }
    >
      {isLoading || !descriptor ? (
        <output
          aria-label={t('signIn.preparing')}
          className="text-body flex min-h-48 w-full items-center justify-center text-center text-muted-foreground"
        >
          {t('signIn.preparing')}
        </output>
      ) : (
        <CrdKratosFlow
          descriptor={descriptor}
          resetPasswordElement={
            <a
              href={forgotPasswordHref}
              className="text-body self-start rounded-sm text-primary outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {t('signIn.forgotPassword')}
            </a>
          }
          onProviderClick={onProviderClick}
          onPasskeyTrigger={onPasskeyTrigger}
        />
      )}
    </AuthCard>
  );
}
