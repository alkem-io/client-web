import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import RegistrationPage from '../../core/auth/authentication/pages/RegistrationPage';
import RegistrationSuccessPage from '../../core/auth/authentication/pages/RegistrationSuccessPage';
import { useQueryParams } from '../../hooks';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  return (
    <Routes>
      <Route
        path={'/'}
        element={
          <NotAuthenticatedRoute>
            <RegistrationPage flow={flow} />
          </NotAuthenticatedRoute>
        }
      />
      <Route path={'success'} element={<RegistrationSuccessPage />} />
    </Routes>
  );
};
export default RegistrationRoute;
