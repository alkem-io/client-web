import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { HubContextProvider } from '../../../domain/hub/HubContext/HubContext';
import { useTransactionScope } from '../../../hooks';
import { Error404, PageProps } from '../../../pages';
import AdminHubsPage from '../../../pages/Admin/AdminHubs/AdminHubsPage';
import NewHub from '../../../pages/Admin/Hub/NewHub';
import { nameOfUrl } from '../../url-params';
import { HubRoute } from './HubRoute';

export const HubsRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: url,
        name: t('common.hubs'),
        real: true,
      },
    ],
    []
  );

  return (
    <Routes>
      <Route index element={<AdminHubsPage paths={currentPaths} />} />
      <Route path={'new'} element={<NewHub paths={currentPaths} />} />
      <Route
        path={`:${nameOfUrl.hubNameId}/*`}
        element={
          <HubContextProvider>
            <HubRoute paths={currentPaths} />
          </HubContextProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
