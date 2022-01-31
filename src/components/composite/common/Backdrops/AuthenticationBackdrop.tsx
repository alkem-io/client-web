import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BackdropWithMessage, { BackdropProps } from './BackdropWithMessage';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import Button from '../../../core/Button';
import { useAuthenticationContext } from '../../../../hooks';

const AuthenticationBackdrop: FC<BackdropProps> = ({ children, blockName }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthenticationContext();

  return (
    <BackdropWithMessage
      message={t('components.backdrop.authentication', { blockName })}
      children={children}
      show={!isAuthenticated}
      template={
        <Button onClick={() => navigate(AUTH_LOGIN_PATH, { replace: true })} text={t('authentication.sign-in')} />
      }
    />
  );
};

export default AuthenticationBackdrop;
