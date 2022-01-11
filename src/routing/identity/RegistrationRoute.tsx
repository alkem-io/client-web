import React, { FC } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import RegistrationPage from '../../pages/Authentication/RegistrationPage';
import RegistrationSuccessPage from '../../pages/Authentication/RegistrationSuccessPage';
import { NotAuthenticatedRoute } from '../NotAuthenticatedRoute';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  return (
    <Routes>
      <Route
        exact
        path={`${path}`}
        render={() => (
          <NotAuthenticatedRoute>
            <RegistrationPage flow={flow} />
          </NotAuthenticatedRoute>
        )}
      />

      <Route exact path={`${path}/success`}>
        <RegistrationSuccessPage />
      </Route>
    </Routes>
  );
};
export default RegistrationRoute;
