import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
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
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: url,
        name: t('common.ecoverses'),
        real: true,
      },
    ],
    []
  );

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <EcoverseList paths={currentPaths} />
      </Route>
      <Route path={`${path}/new`}>
        <NewEcoverse paths={currentPaths} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.ecoverseNameId}`}>
        <EcoverseProvider>
          <EcoverseRoute paths={currentPaths} />
        </EcoverseProvider>
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
