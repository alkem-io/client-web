import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import { FourOuFour } from '../../pages';
import { Path } from '../../context/NavigationProvider';
import ApplicationPage from '../../components/Admin/Community/ApplicationPage';
import { Application } from '../../types/graphql-schema';
import ApplicationDetailsPage from '../../components/Admin/Community/ApplicationDetailsPage';

interface Props {
  paths: Path[];
  applications: Application[];
}

export const ApplicationRoute: FC<Props> = ({ paths, applications }) => {
  const { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/:appId`}>
        <ApplicationDetailsPage />
      </Route>
      <Route path={path}>
        <ApplicationPage paths={paths} url={url} applications={applications} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
