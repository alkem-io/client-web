import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import EmailVerificationNotice from '../../verification/components/EmailVerificationNotice/EmailVerificationNotice';
import AuthPageContentContainer from '../../../../domain/shared/layout/AuthPageContentContainer';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { PageTitle } from '../../../ui/typography';

export const EmailVerificationRequiredPage: FC = () => {
  const { t } = useTranslation();

  return (
    <AuthPageContentContainer>
      <FixedHeightLogo />
      <PageTitle>{t('pages.verification-required.header')}</PageTitle>
      <EmailVerificationNotice />
    </AuthPageContentContainer>
  );
};

export default EmailVerificationRequiredPage;
