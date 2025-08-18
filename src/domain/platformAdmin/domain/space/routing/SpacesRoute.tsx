import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminSpacesPage from '../AdminSpaceListPage/AdminSpacesPage';

export const SpacesRoute = () => {
  useTransactionScope({ type: 'admin' });

  return (
    <Routes>
      <Route index element={<AdminSpacesPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
