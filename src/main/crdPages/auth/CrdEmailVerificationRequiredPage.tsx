import { useTranslation } from 'react-i18next';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { EmailVerificationRequiredCard } from '@/crd/components/auth/EmailVerificationRequiredCard';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';

export type CrdEmailVerificationRequiredPageProps = {
  /** Translation key for the document title (each route uses a different one). */
  pageTitleKey: TranslationKey;
};

/**
 * Shared "verify your email" reminder page. Mounted both at `/registration/success`
 * (after sign-up) and at `/verify/reminder` (when login finds an unverified email)
 * — only the document title differs between those routes.
 */
export function CrdEmailVerificationRequiredPage({ pageTitleKey }: CrdEmailVerificationRequiredPageProps) {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t(pageTitleKey));
  // Carry the pending returnUrl into the sign-in link so the destination stays
  // in the URL when the user signs in after verifying.
  const { returnUrl } = useReturnUrl();

  return (
    <AuthShellWrapper>
      <EmailVerificationRequiredCard signInHref={buildLoginUrl(returnUrl)} />
    </AuthShellWrapper>
  );
}
