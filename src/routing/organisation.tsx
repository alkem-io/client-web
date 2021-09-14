import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { FourOuFour, PageProps } from '../pages';
import OrganisationPage from '../pages/organisation/OrganisationPage';
import { useOrganisation, useUserContext } from '../hooks';
import { AuthorizationCredential } from '../models/graphql-schema';

const OrganisationRoute: FC<PageProps> = ({ paths }) => {
  const { path } = useRouteMatch();
  const currentPaths = useMemo(() => [{ value: '/', name: 'organisation', real: false }], [paths]);

  const { organisation } = useOrganisation();
  const { user } = useUserContext();

  const isAdmin = useMemo(
    () =>
      user?.hasCredentials(AuthorizationCredential.OrganisationOwner) ||
      user?.hasCredentials(AuthorizationCredential.OrganisationAdmin) ||
      false,
    [user]
  );

  if (!organisation) {
    return <FourOuFour />;
  }

  return (
    <Switch>
      <Route path={path}>
        <OrganisationPage paths={currentPaths} permissions={{ edit: isAdmin }} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default OrganisationRoute;
