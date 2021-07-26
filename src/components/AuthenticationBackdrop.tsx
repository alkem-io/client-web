import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import BackdropWithMessage, { BackdropProps } from './BackdropWithMessage';
import { AUTH_LOGIN_PATH } from '../models/Constants';
import Button from './core/Button';

const AuthenticationBackdrop: FC<BackdropProps> = ({ children, blockName, show = false }) => {
  const { t } = useTranslation();
  const history = useHistory();

  return (
    <BackdropWithMessage
      message={t('components.backdrop.authentication', { blockName })}
      children={children}
      show={show}
      template={<Button onClick={() => history.push(AUTH_LOGIN_PATH)} text={t('authentication.sign-in')} />}
    />
  );
};

export default AuthenticationBackdrop;
