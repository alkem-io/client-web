import { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { PARAM_NAME_RETURN_URL, STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
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

  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <NotAuthenticatedRoute>
            <LoginPage flow={flow} />
          </NotAuthenticatedRoute>
        }
      />
      <Route path={'success'} element={<LoginSuccessPage />} />
    </Routes>
  );
};

export default LoginRoute;
