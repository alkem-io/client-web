import React, { FC } from 'react';
import { Route, Routes, useRouteMatch } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import VerificationPage from '../../pages/Authentication/VerificationPage';
import VerificationSuccessPage from '../../pages/Authentication/VerificationSuccessPage';

interface VerifyRouteProps {}

export const VerifyRoute: FC<VerifyRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const { path } = useRouteMatch();

  return (
    <Routes>
      <Route exact path={`${path}`}>
        <VerificationPage flow={flow} />
      </Route>
      <Route exact path={`${path}/success`}>
        <VerificationSuccessPage />
      </Route>
    </Routes>
  );
};
export default VerifyRoute;
