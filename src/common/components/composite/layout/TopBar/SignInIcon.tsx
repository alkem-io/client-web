import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RouterLink } from '../../../core/RouterLink';
import InputIcon from '@mui/icons-material/Input';
import { buildLoginUrl } from '../../../../utils/urlBuilders';

interface SignInIconProps {
  className: string;
  returnUrl?: string;
}

const SignInIcon = ({ className, returnUrl }: SignInIconProps) => {
  const { t } = useTranslation();

  return (
    <Button
      to={buildLoginUrl(returnUrl)}
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
