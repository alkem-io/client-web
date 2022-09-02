import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useGlobalState } from '../../../../hooks';
import { Error404 } from '../../../../pages';
import RestrictedRoute from '../../../../routing/RestrictedRoute';
import { HIDE_LOGIN_NAVIGATION, SHOW_LOGIN_NAVIGATION } from '../../../state/global/ui/loginNavigationMachine';
import AuthRequiredPage from '../pages/AuthRequiredPage';
import ErrorRoute from './ErrorRoute';
import LoginRoute from './LoginRoute';
import LogoutRoute from './LogoutRoute';
import RecoveryRoute from './RecoveryRoute';
import RegistrationRoute from './RegistrationRoute';
import SettingsRoute from './SettingsRoute';
import VerifyRoute from './VerifyRoute';

export const IdentityRoute: FC = () => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  useEffect(() => {
    loginNavigationService.send(HIDE_LOGIN_NAVIGATION);
    return () => {
      loginNavigationService.send(SHOW_LOGIN_NAVIGATION);
    };
  }, []);

  return (
    <Routes>
      <Route path={'login/*'} element={<LoginRoute />} />
      <Route path={'logout'} element={<LogoutRoute />} />
      <Route path={'registration/*'} element={<RegistrationRoute />} />
      <Route path={'verify/*'} element={<VerifyRoute />} />
      <Route path={'recovery'} element={<RecoveryRoute />} />
      <Route path={'required'} element={<AuthRequiredPage />} />
      <Route path={'error'} element={<ErrorRoute />} />
      <Route
        path={'settings'}
        element={
          <RestrictedRoute>
            <SettingsRoute />
          </RestrictedRoute>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
