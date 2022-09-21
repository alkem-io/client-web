import React, { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useQueryParams } from '../../../../hooks';
import { RETURN_URL, STORAGE_KEY_RETURN_URL } from '../../../../models/constants';
import { NotAuthenticatedRoute } from '../../../routing/NotAuthenticatedRoute';
import LoginPage from '../pages/LoginPage';
import LoginSuccessPage from '../pages/LoginSuccessPage';

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
