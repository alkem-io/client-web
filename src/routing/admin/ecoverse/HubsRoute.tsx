import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { HubProvider } from '../../../context/HubProvider';
import { useTransactionScope } from '../../../hooks';
import { Error404, PageProps } from '../../../pages';
import HubList from '../../../pages/Admin/Hub/HubList';
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
      <Route path={'/'}>
        <Route index element={<HubList paths={currentPaths} />}></Route>
        <Route path={'new'} element={<NewHub paths={currentPaths} />}></Route>
        <Route
          path={`:${nameOfUrl.hubNameId}/*`}
          element={
            <HubProvider>
              <HubRoute paths={currentPaths} />
            </HubProvider>
          }
        ></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
