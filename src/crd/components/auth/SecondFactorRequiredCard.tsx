import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

/**
 * `enrol`: no second factor yet. `secondWay`: a single way to pass the second
 * step, where the rule asks for two. `enrolled`: enough is set up, and only
 * signing in again is left.
 */
export type SecondFactorRequiredState = 'loading' | 'unavailable' | 'app' | 'enrol' | 'secondWay' | 'enrolled';

export type SecondFactorRequiredCardProps = {
  state: SecondFactorRequiredState;
  /** The enrolment UI, rendered in the `enrol` and `secondWay` states. */
  enrolment?: ReactNode;
  signInAgainHref: string;
  signOutHref: string;
};

const NOTICE_KEY = {
  unavailable: 'secondFactorPage.unavailable',
  app: 'secondFactorPage.app',
  enrol: 'secondFactorPage.required',
  secondWay: 'secondFactorPage.secondWay',
  enrolled: 'secondFactorPage.enrolled',
} as const;

/**
 * The page a session refused by a second-factor rule is sent to: set up a
 * second factor, or a second way to pass the second step, then sign in again —
 * or sign out.
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

  const enrolling = state === 'enrol' || state === 'secondWay';

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
        {enrolling ? enrolment : null}
        <div className="flex flex-col gap-3">
          <Button
            asChild={true}
            variant={enrolling ? 'outline' : 'default'}
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
