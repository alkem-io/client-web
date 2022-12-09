import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { useTransactionScope } from '../../../../../core/analytics/useSentry';
import { PageProps } from '../../../../shared/types/PageProps';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../core/routing/urlParams';
import { HubContextProvider } from '../../../../challenge/hub/HubContext/HubContext';
import AdminHubsPage from '../pages/AdminHubsPage';
import NewHub from '../pages/NewHub';
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
    [paths, url, t]
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
