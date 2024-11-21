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

export const IdentityRoute = () => {
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
