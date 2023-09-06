import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import EmailVerificationNotice from '../../verification/components/EmailVerificationNotice/EmailVerificationNotice';
import AuthPageContentContainer from '../../../../domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { useUserContext } from '../../../../domain/community/user';
import { PageTitle } from '../../../ui/typography';
import { useReturnUrl } from '../utils/SignUpReturnUrl';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const returnUrl = useReturnUrl();

  return (
    <AuthPageContentContainer>
      <FixedHeightLogo />
      <PageTitle>{t('pages.registration-success.header', { firstName: user?.user?.firstName })}</PageTitle>
      {returnUrl && <EmailVerificationNotice returnUrl={returnUrl} />}
    </AuthPageContentContainer>
  );
};

export default RegistrationSuccessPage;
