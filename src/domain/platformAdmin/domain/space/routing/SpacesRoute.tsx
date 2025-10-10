import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminSpacesPageV2 from '../AdminSpaceListPage/AdminSpacesPageV2';

export const SpacesRoute = () => {
  useTransactionScope({ type: 'admin' });

  return (
    <Routes>
      <Route index element={<AdminSpacesPageV2 />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
