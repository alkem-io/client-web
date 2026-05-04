import { Route } from 'react-router-dom';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { CrdAuthRequiredRoute } from '@/main/crdPages/error/CrdAuthRequiredRoute';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';
import AuthRequiredPage from '../pages/AuthRequiredPage';
import SignUp from '../pages/SignUp';
import ErrorRoute from './ErrorRoute';
import LoginRoute from './LoginRoute';
import LogoutRoute from './LogoutRoute';
import RecoveryRoute from './RecoveryRoute';
import RegistrationRoute from './RegistrationRoute';
import SettingsRoute from './SettingsRoute';
import VerifyRoute from './VerifyRoute';

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
  const crdEnabled = useCrdEnabled();
  return (
    <>
      <Route path={`${IdentityRoutes.Login}/*`} element={<LoginRoute />} />
      <Route path={`${IdentityRoutes.Logout}`} element={<LogoutRoute />} />
      <Route path={`${IdentityRoutes.Registration}/*`} element={<RegistrationRoute />} />
      <Route path={`${IdentityRoutes.Verify}/*`} element={<VerifyRoute />} />
      <Route path={`${IdentityRoutes.Recovery}`} element={<RecoveryRoute />} />
      <Route
        path={`${IdentityRoutes.Required}`}
        element={crdEnabled ? <CrdAuthRequiredRoute /> : <AuthRequiredPage />}
      />
      <Route path={`${IdentityRoutes.Error}`} element={<ErrorRoute />} />
      <Route
        path={`${IdentityRoutes.Settings}`}
        element={
          <NoIdentityRedirect>
            <SettingsRoute />
          </NoIdentityRedirect>
        }
      />
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
