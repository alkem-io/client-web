import ErrorOutline from '@mui/icons-material/ErrorOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../../../common/components/core/Button';
import Typography from '../../../../common/components/core/Typography';
import { useQueryParams } from '../../../../hooks';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import { AUTH_REGISTER_PATH } from '../../../../models/constants';
import { Box } from '@mui/material';
import { buildLoginUrl } from '../../../../common/utils/urlBuilders';

interface AuthRequiredPageProps {}

export const AuthRequiredPage: FC<AuthRequiredPageProps> = () => {
  const returnUrl = useQueryParams().get('returnUrl') ?? undefined;
  const { t } = useTranslation();

  return (
    <AuthenticationLayout>
      <Box textAlign={'center'}>
        <Typography variant={'h2'}>
          <ErrorOutline color={'primary'} fontSize={'large'} />
        </Typography>
        <Typography variant={'h2'}>{t('pages.authentication-required.header')}</Typography>
        <Typography variant={'h3'}>{t('pages.authentication-required.subheader')}</Typography>
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <Button
          as={Link}
          to={buildLoginUrl(returnUrl)}
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
