import { Route } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import AuthRequiredPage from '../pages/AuthRequiredPage';
import ErrorRoute from './ErrorRoute';
import LoginRoute from './LoginRoute';
import LogoutRoute from './LogoutRoute';
import RecoveryRoute from './RecoveryRoute';
import RegistrationRoute from './RegistrationRoute';
import SettingsRoute from './SettingsRoute';
import VerifyRoute from './VerifyRoute';
import SignUp from '../pages/SignUp';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';

export enum IdentityRoutes {
  Login = 'login',
  Logout = 'logout',
  Registration = 'registration',
  SignUp = 'sign_up',
  Verify = 'verify',
  Recovery = 'recovery',
  Required = 'required',
  Error = 'error',
  Settings = 'settings',
}

export const IdentityRoute = () => {
  return (
    <>
      <Route path={`${IdentityRoutes.Login}/*`} element={<LoginRoute />} />
      <Route path={`${IdentityRoutes.Logout}`} element={<LogoutRoute />} />
      <Route path={`${IdentityRoutes.Registration}/*`} element={<RegistrationRoute />} />
      <Route path={`${IdentityRoutes.Verify}/*`} element={<VerifyRoute />} />
      <Route path={`${IdentityRoutes.Recovery}`} element={<RecoveryRoute />} />
      <Route path={`${IdentityRoutes.Required}`} element={<AuthRequiredPage />} />
      <Route path={`${IdentityRoutes.Error}`} element={<ErrorRoute />} />
      <Route
        path={`${IdentityRoutes.Settings}`}
        element={
          <NoIdentityRedirect>
            <SettingsRoute />
          </NoIdentityRedirect>
        }
      />
      <Route path="*" element={<Error404 />} />
      <Route
        path={`${IdentityRoutes.SignUp}`}
        element={
          <NotAuthenticatedRoute>
            <SignUp />
          </NotAuthenticatedRoute>
        }
      />
    </>
  );
};
