import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';

export type EmailVerificationRequiredCardProps = {
  signInHref: string;
};

/** The "please verify your email" reminder screen — a static message, no form. */
export function EmailVerificationRequiredCard({ signInHref }: EmailVerificationRequiredCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <AuthCard
      title={t('verificationReminder.title')}
      header={
        <AuthCardHeader
          contextLabel={t('signUp.haveAccount')}
          contextLinkLabel={t('signUp.signIn')}
          contextLinkHref={signInHref}
        />
      }
    >
      <p className="text-body text-muted-foreground">{t('verificationReminder.body')}</p>
    </AuthCard>
  );
}
