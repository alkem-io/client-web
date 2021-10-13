import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { Error404, PageProps } from '../../pages';
import OrganizationPage from '../../pages/Organization/OrganizationPage';
import { useOrganization, useUserContext } from '../../hooks';
import { AuthorizationCredential } from '../../models/graphql-schema';

const OrganizationRoute: FC<PageProps> = ({ paths }) => {
  const { path } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: '/', name: 'organization', real: false }], [paths]);

  const { organization } = useOrganization();
  const { user } = useUserContext();

  const isAdmin = useMemo(
    () =>
      user?.hasCredentials(AuthorizationCredential.OrganizationOwner) ||
      user?.hasCredentials(AuthorizationCredential.OrganizationAdmin) ||
      false,
    [user]
  );

  if (!organization) {
    return <Error404 />;
  }

  return (
    <Switch>
      <Route path={path}>
        <OrganizationPage paths={currentPaths} permissions={{ edit: isAdmin }} />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default OrganizationRoute;
