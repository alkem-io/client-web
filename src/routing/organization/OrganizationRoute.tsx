import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Loading } from '../../components/core';
import { useOrganization } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import OrganizationPage from '../../pages/Organization/OrganizationPage';

const OrganizationRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { organization, displayName, loading } = useOrganization();

  const rootPaths = useMemo(() => [{ value: '/', name: 'organization', real: false }], [paths]);
  const currentPaths = useMemo(
    () => (organization ? [...rootPaths, { value: url, name: displayName, real: true }] : rootPaths),
    [rootPaths, displayName]
  );

  if (loading) return <Loading />;

  if (!organization) {
    return <Error404 />;
  }

  return (
    <Switch>
      <Route path={path}>
        <OrganizationPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default OrganizationRoute;
