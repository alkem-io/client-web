import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '../../core/auth/authentication/pages/LoginPage';
import LoginSuccessPage from '../../core/auth/authentication/pages/LoginSuccessPage';
import { useQueryParams } from '../../hooks';
import { STORAGE_KEY_RETURN_URL, RETURN_URL } from '../../models/constants';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  const returnUrl = params.get(RETURN_URL);

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
      <Route path={'success'} element={<LoginSuccessPage />}></Route>
    </Routes>
  );
};

export default LoginRoute;
