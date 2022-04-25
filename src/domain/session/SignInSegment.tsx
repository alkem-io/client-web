import React, { FC } from 'react';
import { Box, Button } from '@mui/material';
import { RouterLink } from '../../components/core/RouterLink';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../models/constants';
import { useTranslation } from 'react-i18next';

const SignInSegment: FC = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Button
        aria-label="Sign up"
        component={RouterLink}
        to={AUTH_REGISTER_PATH}
        sx={{
          padding: theme => theme.spacing(0.5, 1),
        }}
        variant="text"
        size="small"
      >
        {t('authentication.sign-up')}
      </Button>
      <Button
        aria-label="Sign in"
        component={RouterLink}
        to={AUTH_LOGIN_PATH}
        sx={{
          padding: theme => theme.spacing(0.5, 1),
        }}
        variant="text"
        size="small"
      >
        {t('authentication.sign-in')}
      </Button>
    </Box>
  );
};

export default SignInSegment;
