import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import EmailVerificationRequiredPage from '../../core/auth/authentication/pages/EmailVerificationRequiredPage';
import VerificationPage from '../../core/auth/authentication/pages/VerificationPage';
import VerificationSuccessPage from '../../core/auth/authentication/pages/VerificationSuccessPage';
import { useQueryParams } from '../../hooks';

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
