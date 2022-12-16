import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import { Box } from '@mui/material';

interface VerificationSuccessPageProps {}

export const VerificationSuccessPage: FC<VerificationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <WrapperTypography variant={'h2'}>
          <CheckCircleOutline color="primary" fontSize="large" />
        </WrapperTypography>
        <WrapperTypography variant={'h2'}>{t('pages.verification-success.header')}</WrapperTypography>
        <WrapperTypography variant={'h3'}>{t('pages.verification-success.subheader')}</WrapperTypography>
        <WrapperMarkdown children={t('pages.verification-success.message')} />
        <WrapperButton as={Link} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};

export default VerificationSuccessPage;
