import { ReactComponent as CheckCircle } from 'bootstrap-icons/icons/check-circle.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/core/Button';
import Icon from '../../components/core/Icon';
import Markdown from '../../components/core/Markdown';
import Typography from '../../components/core/Typography';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import { Box } from '@material-ui/core';

interface VerificationSuccessPageProps {}

export const VerificationSuccessPage: FC<VerificationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <Typography variant={'h2'}>
          <Icon component={CheckCircle} color={'primary'} size={'xl'} />
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
