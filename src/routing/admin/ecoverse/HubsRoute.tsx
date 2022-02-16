import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { EcoverseProvider } from '../../../context/EcoverseProvider';
import { useTransactionScope } from '../../../hooks';
import { Error404, PageProps } from '../../../pages';
import EcoverseList from '../../../pages/Admin/Ecoverse/EcoverseList';
import NewEcoverse from '../../../pages/Admin/Ecoverse/NewEcoverse';
import { nameOfUrl } from '../../url-params';
import { EcoverseRoute } from './EcoverseRoute';

export const EcoversesRoute: FC<PageProps> = ({ paths }) => {
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
        <Route index element={<EcoverseList paths={currentPaths} />}></Route>
        <Route path={'new'} element={<NewEcoverse paths={currentPaths} />}></Route>
        <Route
          path={`:${nameOfUrl.hubNameId}/*`}
          element={
            <EcoverseProvider>
              <EcoverseRoute paths={currentPaths} />
            </EcoverseProvider>
          }
        ></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
