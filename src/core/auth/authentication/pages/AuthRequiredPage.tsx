import ErrorOutline from '@mui/icons-material/ErrorOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import { useQueryParams } from '../../../routing/useQueryParams';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import { AUTH_REGISTER_PATH } from '../constants/authentication.constants';
import { Box } from '@mui/material';
import { buildLoginUrl } from '../../../../common/utils/urlBuilders';

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
      <Box marginTop={4} textAlign={'center'}>
        <WrapperButton
          as={Link}
          to={buildLoginUrl(returnUrl)}
          variant={'primary'}
          style={{ marginLeft: 20 }}
          text={t('authentication.sign-in')}
        />
        <WrapperButton
          as={Link}
          to={AUTH_REGISTER_PATH}
          style={{ marginLeft: 20 }}
          text={t('authentication.sign-up')}
        />
      </Box>
    </AuthenticationLayout>
  );
};

export default AuthRequiredPage;
