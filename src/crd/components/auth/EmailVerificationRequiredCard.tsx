import { useTranslation } from 'react-i18next';
import { AuthCardHeader } from '@/crd/components/auth/AuthCardHeader';

export type EmailVerificationRequiredCardProps = {
  signInHref: string;
};

/** The "please verify your email" reminder screen — a static message, no form. */
export function EmailVerificationRequiredCard({ signInHref }: EmailVerificationRequiredCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="mb-6">
        <AuthCardHeader
          contextLabel={t('signUp.haveAccount')}
          contextLinkLabel={t('signUp.signIn')}
          contextLinkHref={signInHref}
        />
      </div>

      <h1 className="text-hero mb-6 text-foreground">{t('verificationReminder.title')}</h1>
      <p className="text-body text-muted-foreground">{t('verificationReminder.body')}</p>
    </div>
  );
}
