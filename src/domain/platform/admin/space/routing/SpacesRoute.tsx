import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '../../../../../core/analytics/SentryTransactionScopeContext';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../main/routing/urlParams';
import { SpaceContextProvider } from '../../../../journey/space/SpaceContext/SpaceContext';
import AdminSpacesPage from '../AdminSpaceListPage/AdminSpacesPage';
import NewSpace from '../AdminSpaceListPage/NewSpace';
import { SpaceRoute } from './SpaceRoute';

export const SpacesRoute = () => {
  useTransactionScope({ type: 'admin' });

  return (
    <Routes>
      <Route index element={<AdminSpacesPage />} />
      <Route path={'new'} element={<NewSpace />} />
      <Route
        path={`:${nameOfUrl.spaceNameId}/*`}
        element={
          <SpaceContextProvider>
            <SpaceRoute />
          </SpaceContextProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
