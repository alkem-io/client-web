import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import { LOCAL_STORAGE_RETURN_URL_KEY, RETURN_URL } from '../../models/constants';
import LoginPage from '../../pages/Authentication/LoginPage';
import LoginSuccessPage from '../../pages/Authentication/LoginSuccessPage';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const LoginRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  const returnUrl = useQueryParams().get(RETURN_URL);

  if (returnUrl) {
    localStorage.setItem(LOCAL_STORAGE_RETURN_URL_KEY, returnUrl);
  }

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
