import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { useTransactionScope } from '../../../../../core/analytics/SentryTransactionScopeContext';
import { PageProps } from '../../../../shared/types/PageProps';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../../main/routing/urlParams';
import { SpaceContextProvider } from '../../../../journey/space/SpaceContext/SpaceContext';
import AdminSpacesPage from '../AdminSpaceListPage/AdminSpacesPage';
import NewSpace from '../AdminSpaceListPage/NewSpace';
import { SpaceRoute } from './SpaceRoute';

export const SpacesRoute: FC<PageProps> = ({ paths }) => {
  const { t } = useTranslation();
  useTransactionScope({ type: 'admin' });
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: url,
        name: t('common.spaces'),
        real: true,
      },
    ],
    [paths, url, t]
  );

  return (
    <Routes>
      <Route index element={<AdminSpacesPage />} />
      <Route path={'new'} element={<NewSpace paths={currentPaths} />} />
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
