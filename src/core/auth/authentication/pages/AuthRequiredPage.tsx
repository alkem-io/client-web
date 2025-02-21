import { _AUTH_LOGIN_PATH, AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';
import AuthenticationLayout from '@/main/ui/layout/AuthenticationLayout';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const AuthRequiredPage = () => {
  const returnUrl = useQueryParams().get('returnUrl') ?? undefined;
  const { t } = useTranslation();

  /**
   * AuthRequiredPage can't use buildLoginUrl() directly for the following reasons:
   * - it belongs to /identity routes and is accessed from identity subdomain while the resource the user was trying
   * to access most likely was on the root domain or in an innovation hub.
   * - it isn't meant to be returned back to, the page the user intended to visit is the previous one.
   *
   * For Login/SignUp redirection to work this component receives the full returnUrl with origin already baked in.
   */
  const returnUrlParam = buildReturnUrlParam(returnUrl, '');
  const loginUrl = `${_AUTH_LOGIN_PATH}${returnUrlParam}`;
  const signUpUrl = `${AUTH_SIGN_UP_PATH}${returnUrlParam}`;

  return (
    <AuthenticationLayout>
      <Box textAlign="center">
        <ErrorOutline color="primary" fontSize="large" sx={{ mb: 1 }} />
        <Typography variant="h2" mb={1} fontWeight="medium" textTransform="uppercase">
          {t('pages.authentication-required.header')}
        </Typography>
        <Typography variant="h3" fontWeight="medium">
          {t('pages.authentication-required.subheader')}
        </Typography>
      </Box>
      <Box display="flex" marginTop={4} gap={2} justifyContent="center">
        <Button component={Link} to={loginUrl} variant="outlined" color="primary">
          {t('authentication.sign-in')}
        </Button>
        <Button component={Link} to={signUpUrl} variant="outlined">
          {t('authentication.sign-up')}
        </Button>
      </Box>
    </AuthenticationLayout>
  );
};

export default AuthRequiredPage;
