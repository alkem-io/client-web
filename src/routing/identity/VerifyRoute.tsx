import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useQueryParams } from '../../hooks';
import VerificationPage from '../../pages/Authentication/VerificationPage';
import VerificationSuccessPage from '../../pages/Authentication/VerificationSuccessPage';

interface VerifyRouteProps {}

export const VerifyRoute: FC<VerifyRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  return (
    <Routes>
      <Route path={'/'} element={<VerificationPage flow={flow} />} />
      <Route path={'success'} element={<VerificationSuccessPage />} />
    </Routes>
  );
};
export default VerifyRoute;
