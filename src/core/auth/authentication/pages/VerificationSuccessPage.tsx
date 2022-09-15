import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../../../common/components/core/Button';
import Markdown from '../../../../common/components/core/Markdown';
import Typography from '../../../../common/components/core/Typography';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import { Box } from '@mui/material';

interface VerificationSuccessPageProps {}

export const VerificationSuccessPage: FC<VerificationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <Typography variant={'h2'}>
          <CheckCircleOutline color="primary" fontSize="large" />
        </Typography>
        <Typography variant={'h2'}>{t('pages.verification-success.header')}</Typography>
        <Typography variant={'h3'}>{t('pages.verification-success.subheader')}</Typography>
        <Markdown children={t('pages.verification-success.message')} />
        <Button as={Link} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};
export default VerificationSuccessPage;
