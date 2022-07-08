import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '../../../core/RouterLink';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import InputIcon from '@mui/icons-material/Input';

interface SignInIconProps {
  className: string;
}

const SignInIcon = ({ className }: SignInIconProps) => {
  const { t } = useTranslation();

  return (
    <Button
      key={-1}
      to={AUTH_LOGIN_PATH}
      aria-label={t('authentication.sign-in')}
      component={RouterLink}
      className={className}
      startIcon={<InputIcon />}
    >
      {t('authentication.sign-in')}
    </Button>
  );

  /*
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
  ); */
};

export default SignInIcon;
