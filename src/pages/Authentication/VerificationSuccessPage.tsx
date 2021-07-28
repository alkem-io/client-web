import { ReactComponent as CheckCircle } from 'bootstrap-icons/icons/check-circle.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/core/Button';
import Icon from '../../components/core/Icon';
import Markdown from '../../components/core/Markdown';
import Typography from '../../components/core/Typography';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';

interface VerificationSuccessPageProps {}

export const VerificationSuccessPage: FC<VerificationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout>
      <Typography variant={'h2'} className={'text-center'}>
        <Icon component={CheckCircle} color={'primary'} size={'xl'} />
      </Typography>
      <Typography variant={'h2'} className={'text-center'}>
        {t('pages.verification-success.header')}
      </Typography>
      <Typography variant={'h3'} className={'text-center'}>
        {t('pages.verification-success.subheader')}
      </Typography>
      <Markdown children={t('pages.verification-success.message')} />
      <div className={'mt-4 text-center'}>
        <Button as={Link} to={'/'}>
          {t('buttons.home')}
        </Button>
      </div>
    </AuthenticationLayout>
  );
};
export default VerificationSuccessPage;
