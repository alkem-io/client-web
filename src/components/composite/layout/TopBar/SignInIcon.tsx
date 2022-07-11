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
      to={AUTH_LOGIN_PATH}
      aria-label={t('authentication.sign-in')}
      component={RouterLink}
      className={className}
      startIcon={<InputIcon />}
    >
      {t('authentication.sign-in')}
    </Button>
  );
};

export default SignInIcon;
