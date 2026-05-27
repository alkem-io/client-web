import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';

export type ErrorCardProps = {
  errorCode?: string;
  errorMessage?: string;
  errorReason?: string;
  signInHref: string;
  isLoading?: boolean;
};

/** Auth-error fallback screen — shows the resolved Kratos error and a way back. */
export function ErrorCard({ errorCode, errorMessage, errorReason, signInHref, isLoading }: ErrorCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <AuthCard title={t('error.title')}>
      {isLoading ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-12 w-full" />
        </output>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-body text-foreground">{errorMessage || t('error.generic')}</p>
          {errorReason ? <p className="text-caption text-muted-foreground">{errorReason}</p> : null}
          {errorCode ? (
            <p className="text-caption text-muted-foreground">{t('error.code', { code: errorCode })}</p>
          ) : null}
          <Button asChild={true} className="text-control mt-2 h-12 w-full font-semibold uppercase tracking-wider">
            <a href={signInHref}>{t('error.backToSignIn')}</a>
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
