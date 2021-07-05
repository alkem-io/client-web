import { ReactComponent as CheckCircle } from 'bootstrap-icons/icons/check-circle.svg';
import React, { FC } from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/core/Button';
import Icon from '../../components/core/Icon';
import Typography from '../../components/core/Typography';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Typography variant={'h2'} className={'text-center'}>
        <Icon component={CheckCircle} color={'primary'} size={'xl'} />
      </Typography>
      <Typography variant={'h2'} className={'text-center'}>
        {t('pages.registration-success.header')}
      </Typography>
      <Typography variant={'h3'} className={'text-center'}>
        {t('pages.registration-success.subheader')}
      </Typography>
      <div className={'mt-4 text-center'}>
        <Button as={Link} to={'/'}>
          {t('buttons.home')}
        </Button>
      </div>
    </Container>
  );
};
export default RegistrationSuccessPage;
