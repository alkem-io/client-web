import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import OpportunityAuthorizationPage from '../pages/OpportunityAuthorization/OpportunityAuthorizationPage';

const OpportunityAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<OpportunityAuthorizationPage routePrefix="../../" />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default OpportunityAuthorizationRoute;
