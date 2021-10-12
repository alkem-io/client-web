import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import BackdropWithMessage, { BackdropProps } from './BackdropWithMessage';
import { AUTH_LOGIN_PATH } from '../../../../models/constants';
import Button from '../../../core/Button';
import { useAuthenticationContext } from '../../../../hooks';

const AuthenticationBackdrop: FC<BackdropProps> = ({ children, blockName }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const { isAuthenticated } = useAuthenticationContext();

  return (
    <BackdropWithMessage
      message={t('components.backdrop.authentication', { blockName })}
      children={children}
      show={!isAuthenticated}
      template={<Button onClick={() => history.push(AUTH_LOGIN_PATH)} text={t('authentication.sign-in')} />}
    />
  );
};

export default AuthenticationBackdrop;
