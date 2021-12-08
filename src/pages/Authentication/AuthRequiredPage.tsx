import { ReactComponent as CheckCircle } from 'bootstrap-icons/icons/exclamation-circle.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/core/Button';
import Icon from '../../components/core/Icon';
import Typography from '../../components/core/Typography';
import { useQueryParams } from '../../hooks';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH, LOCAL_STORAGE_RETURN_URL_KEY } from '../../models/constants';
import { Box } from '@mui/material';

interface AuthRequiredPageProps {}

export const AuthRequiredPage: FC<AuthRequiredPageProps> = () => {
  const returnUrl = useQueryParams().get('returnUrl');
  const { t } = useTranslation();
  if (returnUrl) {
    localStorage.setItem(LOCAL_STORAGE_RETURN_URL_KEY, returnUrl);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_RETURN_URL_KEY);
  }

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <Typography variant={'h2'}>
          <Icon component={CheckCircle} color={'primary'} size={'xl'} />
        </Typography>
        <Typography variant={'h2'}>{t('pages.authentication-required.header')}</Typography>
        <Typography variant={'h3'}>{t('pages.authentication-required.subheader')}</Typography>
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <Button
          as={Link}
          to={AUTH_LOGIN_PATH}
          variant={'primary'}
          style={{ marginLeft: 20 }}
          text={t('authentication.sign-in')}
        />
        <Button as={Link} to={AUTH_REGISTER_PATH} style={{ marginLeft: 20 }} text={t('authentication.sign-up')} />
      </Box>
    </AuthenticationLayout>
  );
};
export default AuthRequiredPage;
