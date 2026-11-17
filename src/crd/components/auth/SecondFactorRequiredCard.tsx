import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type SecondFactorRequiredState = 'loading' | 'unavailable' | 'app' | 'enrol' | 'enrolled';

export type SecondFactorRequiredCardProps = {
  state: SecondFactorRequiredState;
  /** The enrolment UI, rendered in the `enrol` state. */
  enrolment?: ReactNode;
  signInAgainHref: string;
  signOutHref: string;
};

const NOTICE_KEY = {
  unavailable: 'secondFactorPage.unavailable',
  app: 'secondFactorPage.app',
  enrol: 'secondFactorPage.required',
  enrolled: 'secondFactorPage.enrolled',
} as const;

/**
 * The page a session refused for a missing second factor is sent to: set one
 * up, then sign in again — or sign out.
 */
export function SecondFactorRequiredCard({
  state,
  enrolment,
  signInAgainHref,
  signOutHref,
}: SecondFactorRequiredCardProps) {
  const { t } = useTranslation('crd-auth');

  if (state === 'loading') {
    return (
      <AuthCard title={t('secondFactorPage.title')}>
        <output
          aria-label={t('signIn.preparing')}
          className="text-body flex min-h-48 w-full items-center justify-center text-center text-muted-foreground"
        >
          {t('signIn.preparing')}
        </output>
      </AuthCard>
    );
  }

  const signInFirst = state !== 'enrol';

  return (
    <AuthCard title={t('secondFactorPage.title')}>
      <div className="flex flex-col gap-5">
        <output
          className={cn(
            'text-body block rounded-md px-3 py-2.5',
            state === 'unavailable' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'
          )}
        >
          {t(NOTICE_KEY[state])}
        </output>
        {state === 'enrol' ? enrolment : null}
        <div className="flex flex-col gap-3">
          <Button
            asChild={true}
            variant={signInFirst ? 'default' : 'outline'}
            className="text-control h-12 w-full font-semibold uppercase tracking-wider"
          >
            <a href={signInAgainHref}>{t('secondFactorPage.signInAgain')}</a>
          </Button>
          <Button asChild={true} variant="ghost" className="text-control h-12 w-full">
            <a href={signOutHref}>{t('secondFactorPage.signOut')}</a>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
