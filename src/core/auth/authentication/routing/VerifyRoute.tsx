import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useQueryParams } from '../../../routing/useQueryParams';
import EmailVerificationRequiredPage from '../pages/EmailVerificationRequiredPage';
import VerificationPage from '../pages/VerificationPage';
import { _AUTH_LOGIN_PATH } from '../constants/authentication.constants';
import { error, TagCategoryValues } from '../../../logging/sentry/log';

const RedirectToLogin = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    error(`Kratos config error, redirecting to Login from ${pathname}`, {
      category: TagCategoryValues.CONFIG,
      label: 'Kratos',
    });
  }, []);

  return <Navigate to={_AUTH_LOGIN_PATH} replace />;
};

export const VerifyRoute = () => {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;

  return (
    <Routes>
      <Route path="/" element={<VerificationPage flow={flow} />} />
      <Route path="reminder" element={<EmailVerificationRequiredPage />} />
      <Route path="*" element={<RedirectToLogin />} />
    </Routes>
  );
};

export default VerifyRoute;
