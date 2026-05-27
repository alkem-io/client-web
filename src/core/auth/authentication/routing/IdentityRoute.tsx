import { Route } from 'react-router-dom';
import NoIdentityRedirect from '@/core/routing/NoIdentityRedirect';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { ErrorCrdRoute } from '@/main/crdPages/auth/ErrorCrdRoute';
import { LoginCrdRoute } from '@/main/crdPages/auth/LoginCrdRoute';
import { RecoveryCrdRoute } from '@/main/crdPages/auth/RecoveryCrdRoute';
import { SettingsCrdRoute } from '@/main/crdPages/auth/SettingsCrdRoute';
import { RegistrationCrdRoute, SignUpCrdRoute } from '@/main/crdPages/auth/SignUpCrdRoute';
import { VerifyCrdRoute } from '@/main/crdPages/auth/VerifyCrdRoute';
import { CrdAuthRequiredRoute } from '@/main/crdPages/error/CrdAuthRequiredRoute';
import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';
import AuthRequiredPage from '../pages/AuthRequiredPage';
import LogoutRoute from './LogoutRoute';

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
      {/* Auth screens are un-gated: the CRD screens render for every visitor (see spec 101). */}
      <Route path={`${IdentityRoutes.Login}/*`} element={<LoginCrdRoute />} />
      <Route path={`${IdentityRoutes.Logout}`} element={<LogoutRoute />} />
      <Route path={`${IdentityRoutes.Registration}/*`} element={<RegistrationCrdRoute />} />
      <Route path={`${IdentityRoutes.Verify}/*`} element={<VerifyCrdRoute />} />
      <Route path={`${IdentityRoutes.Recovery}`} element={<RecoveryCrdRoute />} />
      <Route
        path={`${IdentityRoutes.Required}`}
        element={crdEnabled ? <CrdAuthRequiredRoute /> : <AuthRequiredPage />}
      />
      <Route path={`${IdentityRoutes.Error}`} element={<ErrorCrdRoute />} />
      <Route
        path={`${IdentityRoutes.Settings}`}
        element={
          <NoIdentityRedirect>
            <SettingsCrdRoute />
          </NoIdentityRedirect>
        }
      />
      <Route
        path={`${IdentityRoutes.SignUp}`}
        element={
          <NotAuthenticatedRoute>
            <SignUpCrdRoute />
          </NotAuthenticatedRoute>
        }
      />
    </>
  );
};
