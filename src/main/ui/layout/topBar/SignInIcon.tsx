import React, { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { buildLoginUrl } from '../../../routing/urlBuilders';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import { ButtonProps } from '@mui/material';

interface SignInIconProps {
  returnUrl?: string;
  buttonComponent: ComponentType<ButtonProps>;
}

const SignInIcon = ({ buttonComponent: Button, returnUrl }: SignInIconProps) => {
  const { t } = useTranslation();

  return (
    <Button
      href={buildLoginUrl(returnUrl)}
      aria-label={t('authentication.sign-in')}
      startIcon={<AssignmentIndOutlinedIcon />}
    >
      {t('topbar.sign-in')}
    </Button>
  );
};

export default SignInIcon;
