import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '../../../../../core/analytics/SentryTransactionScopeContext';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import AdminSpacesPage from '../AdminSpaceListPage/AdminSpacesPage';
import NewSpace from '../AdminSpaceListPage/NewSpace';

export const SpacesRoute = () => {
  useTransactionScope({ type: 'admin' });

  return (
    <Routes>
      <Route index element={<AdminSpacesPage />} />
      <Route path="new" element={<NewSpace />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
