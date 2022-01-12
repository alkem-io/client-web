import React, { FC } from 'react';
import { Route } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import RegistrationPage from '../../pages/Authentication/RegistrationPage';
import RegistrationSuccessPage from '../../pages/Authentication/RegistrationSuccessPage';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  return (
    <>
      <Route
        element={
          <NotAuthenticatedRoute>
            <RegistrationPage flow={flow} />
          </NotAuthenticatedRoute>
        }
      />

      <Route path={'success'}>
        <RegistrationSuccessPage />
      </Route>
    </>
  );
};
export default RegistrationRoute;
