import { type FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { PARAM_NAME_RETURN_URL, STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import LoginPage from '../pages/LoginPage';
import LoginSuccessPage from '../pages/LoginSuccessPage';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  const returnUrl = params.get(PARAM_NAME_RETURN_URL);

  useEffect(() => {
    if (returnUrl) {
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, returnUrl);
    }
  }, [returnUrl]);

  // A Kratos-initiated login arrives here with a `flow` id in the URL. This
  // includes *refresh* (re-authentication) logins, which Kratos demands before
  // privileged Settings changes — adding a passkey, changing the password —
  // once the session is older than `privileged_session_max_age`. In that case
  // the user already holds a (non-privileged) session, so the usual
  // `NotAuthenticatedRoute` guard would bounce them to the dashboard and the
  // re-auth form would never render, silently aborting the Settings change.
  // Whenever a flow id is present we render the login page regardless of
  // authentication state so the flow (incl. refresh / step-up) can complete.
  const loginPage = <LoginPage flow={flow} />;

  return (
    <Routes>
      <Route path={'/'} element={flow ? loginPage : <NotAuthenticatedRoute>{loginPage}</NotAuthenticatedRoute>} />
      <Route path={'success'} element={<LoginSuccessPage />} />
    </Routes>
  );
};

export default LoginRoute;
