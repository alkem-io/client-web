import ErrorOutline from '@mui/icons-material/ErrorOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import { useQueryParams } from '../../../routing/useQueryParams';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import { AUTH_SIGN_UP_PATH } from '../constants/authentication.constants';
import { Box, Button } from '@mui/material';
import { useLoginUrl } from '../../../../common/utils/urlBuilders';

interface AuthRequiredPageProps {}

export const AuthRequiredPage: FC<AuthRequiredPageProps> = () => {
  const returnUrl = useQueryParams().get('returnUrl') ?? undefined;
  const { t } = useTranslation();

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <WrapperTypography variant={'h2'}>
          <ErrorOutline color={'primary'} fontSize={'large'} />
        </WrapperTypography>
        <WrapperTypography variant={'h2'}>{t('pages.authentication-required.header')}</WrapperTypography>
        <WrapperTypography variant={'h3'}>{t('pages.authentication-required.subheader')}</WrapperTypography>
      </Box>
      <Box display="flex" marginTop={4} gap={2} justifyContent="center">
        <Button component={Link} to={useLoginUrl(returnUrl)} variant="outlined" color="primary">
          {t('authentication.sign-in')}
        </Button>
        <Button component={Link} to={AUTH_SIGN_UP_PATH} variant="outlined">
          {t('authentication.sign-up')}
        </Button>
      </Box>
    </AuthenticationLayout>
  );
};

export default AuthRequiredPage;
