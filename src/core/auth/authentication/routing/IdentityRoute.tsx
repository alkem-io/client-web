import React, { useLayoutEffect } from 'react';
import { Route } from 'react-router-dom';
import { Error404 } from '../../../pages/Errors/Error404';
import NoIdentityRedirect from '../../../routing/NoIdentityRedirect';
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

export const IdentityRoute = () => {
  const config = useConfig();

  // Kratos config for development setup is quite specific, we can't rely on it locally.
  const identityOrigin =
    process.env.NODE_ENV === 'development' ? undefined : config.authentication?.providers[0].config.issuer;

  const isOnIdentityOrigin = window.location.origin === identityOrigin;

  useLayoutEffect(() => {
    if (identityOrigin && !isOnIdentityOrigin) {
      const { pathname, search } = window.location;

      window.location.replace(`${identityOrigin}${pathname}${search}`);
    }
  }, [isOnIdentityOrigin]);

  return (
    <>
      <Route path="login/*" element={<LoginRoute />} />
      <Route path="logout" element={<LogoutRoute />} />
      <Route path="registration/*" element={<RegistrationRoute />} />
      <Route path="verify/*" element={<VerifyRoute />} />
      <Route path="recovery" element={<RecoveryRoute />} />
      <Route path="required" element={<AuthRequiredPage />} />
      <Route path="error" element={<ErrorRoute />} />
      <Route
        path="settings"
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
    </>
  );
};
