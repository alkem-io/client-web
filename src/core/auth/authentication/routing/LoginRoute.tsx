import { type FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { PARAM_NAME_RETURN_URL, STORAGE_KEY_RETURN_URL } from '../constants/authentication.constants';
import LoginPage from '../pages/LoginPage';
import LoginSuccessPage from '../pages/LoginSuccessPage';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
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
            <LoginPage />
          </NotAuthenticatedRoute>
        }
      />
      <Route path={'success'} element={<LoginSuccessPage />} />
    </Routes>
  );
};

export default LoginRoute;
