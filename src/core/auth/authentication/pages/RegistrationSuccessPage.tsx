import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import EmailVerificationNotice from '../../verification/components/EmailVerificationNotice/EmailVerificationNotice';
import Container from '../../../../domain/shared/layout/Container';
import FixedHeightLogo from '../components/FixedHeightLogo';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import { useUserContext } from '../../../../domain/community/contributor/user';
import { PageTitle } from '../../../ui/typography';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  return (
    <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
      <FixedHeightLogo />
      <PageTitle>{t('pages.registration-success.header', { firstName: user?.user?.firstName })}</PageTitle>
      <EmailVerificationNotice />
    </Container>
  );
};

export default RegistrationSuccessPage;
