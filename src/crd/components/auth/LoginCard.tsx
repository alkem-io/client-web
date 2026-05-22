import { useTranslation } from 'react-i18next';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor, KratosPasskeyTrigger } from '@/crd/components/auth/flowDescriptor';
import { Skeleton } from '@/crd/primitives/skeleton';

export type LoginCardProps = {
  /** The adapted login flow. While `undefined` (or `isLoading`), a skeleton renders. */
  descriptor?: KratosFlowDescriptor;
  signUpHref: string;
  forgotPasswordHref: string;
  isLoading?: boolean;
  onProviderClick?: (providerKey: string) => void;
  onPasskeyTrigger?: (trigger: KratosPasskeyTrigger) => void;
};

export function LoginCard({
  descriptor,
  signUpHref,
  forgotPasswordHref,
  isLoading,
  onProviderClick,
  onPasskeyTrigger,
}: LoginCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="mb-6">
        <AuthCardHeader
          contextLabel={t('signIn.noAccount')}
          contextLinkLabel={t('signIn.signUp')}
          contextLinkHref={signUpHref}
        />
      </div>

      <h1 className="text-hero mb-6 text-foreground">{t('signIn.title')}</h1>

      {isLoading || !descriptor ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
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
    </div>
  );
}
