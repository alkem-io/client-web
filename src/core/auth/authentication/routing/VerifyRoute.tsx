import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useQueryParams } from '../../../../hooks';
import EmailVerificationRequiredPage from '../pages/EmailVerificationRequiredPage';
import VerificationPage from '../pages/VerificationPage';
import VerificationSuccessPage from '../pages/VerificationSuccessPage';

interface VerifyRouteProps {}

export const VerifyRoute: FC<VerifyRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  return (
    <Routes>
      <Route path="/" element={<VerificationPage flow={flow} />} />
      <Route path="success" element={<VerificationSuccessPage />} />
      <Route path="reminder" element={<EmailVerificationRequiredPage />} />
    </Routes>
  );
};
export default VerifyRoute;
