import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { FourOuFour, PageProps } from '../pages';
import OrganisationPage from '../pages/organisation/OrganisationPage';

const OrganisationRoute: FC<PageProps> = ({ paths }) => {
  const { path } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: '/', name: 'organisation', real: false }], [paths]);

  return (
    <Switch>
      <Route path={path}>
        <OrganisationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default OrganisationRoute;
