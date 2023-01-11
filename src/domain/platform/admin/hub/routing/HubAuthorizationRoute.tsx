import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import HubAuthorizationPage from '../../../../challenge/hub/pages/HubAuthorization/HubAuthorizationPage';
import AuthorizationRouteProps from '../../routing/AuthorizationRouteProps';

const HubAuthorizationRoute: FC<AuthorizationRouteProps> = ({ resourceId }) => {
  return (
    <Routes>
      <Route index element={<HubAuthorizationPage resourceId={resourceId} routePrefix="../../" />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default HubAuthorizationRoute;
