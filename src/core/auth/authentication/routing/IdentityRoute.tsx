import React, { FC, useLayoutEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useGlobalState } from '../../../state/useGlobalState';
import { Error404 } from '../../../pages/Errors/Error404';
import NoIdentityRedirect from '../../../routing/NoIdentityRedirect';
import { HIDE_LOGIN_NAVIGATION, SHOW_LOGIN_NAVIGATION } from '../../../state/global/ui/loginNavigationMachine';
import AuthRequiredPage from '../pages/AuthRequiredPage';
import ErrorRoute from './ErrorRoute';
import LoginRoute from './LoginRoute';
import LogoutRoute from './LogoutRoute';
import RecoveryRoute from './RecoveryRoute';
import RegistrationRoute from './RegistrationRoute';
import SettingsRoute from './SettingsRoute';
import VerifyRoute from './VerifyRoute';
import SignUp from '../pages/SignUp';
import { NotAuthenticatedRoute } from '../../../routing/NotAuthenticatedRoute';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import Loading from '../../../../common/components/core/Loading/Loading';

export const IdentityRoute: FC = () => {
  const {
    ui: { loginNavigationService },
  } = useGlobalState();

  const config = useConfig();

  // Kratos config for development setup is quite specific, we can't rely on it locally.
  const identityOrigin =
    process.env.NODE_ENV === 'development' ? undefined : config.authentication?.providers[0].config.issuer;

  const isIdentityOrigin = window.location.origin === identityOrigin;

  useLayoutEffect(() => {
    if (identityOrigin && !isIdentityOrigin) {
      const { pathname, search } = window.location;

      window.location.replace(`${identityOrigin}${pathname}${search}`);
    }
  }, [isIdentityOrigin]);

  useLayoutEffect(() => {
    loginNavigationService.send(HIDE_LOGIN_NAVIGATION);
    return () => {
      loginNavigationService.send(SHOW_LOGIN_NAVIGATION);
    };
  }, [loginNavigationService]);

  if (config.loading || (identityOrigin && !isIdentityOrigin)) {
    return <Loading />;
  }

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
          <NoIdentityRedirect>
            <SettingsRoute />
          </NoIdentityRedirect>
        }
      />
      <Route path="*" element={<Error404 />} />
      <Route
        path="sign_up"
        element={
          <NotAuthenticatedRoute>
            <SignUp />
          </NotAuthenticatedRoute>
        }
      />
    </Routes>
  );
};
