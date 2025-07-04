import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import EmailVerificationNotice from '@/core/auth/verification/components/EmailVerificationNotice/EmailVerificationNotice';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { PageTitle } from '@/core/ui/typography';
import { useGetReturnUrl } from '../utils/useSignUpReturnUrl';

export const EmailVerificationRequiredPage: FC = () => {
  const { t } = useTranslation();

  const returnUrl = useGetReturnUrl();

  return (
    <AuthPageContentContainer>
      <FixedHeightLogo />
      <PageTitle>{t('pages.verification-required.header')}</PageTitle>
      {returnUrl && <EmailVerificationNotice returnUrl={returnUrl} />}
    </AuthPageContentContainer>
  );
};

export default EmailVerificationRequiredPage;
