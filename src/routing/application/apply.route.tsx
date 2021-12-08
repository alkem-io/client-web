import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Error404, PageProps } from '../../pages';
import ApplyPage from '../../pages/Application/ApplyPage';
import RestrictedRoute from '../route.extensions';

interface Props extends PageProps {
  type: ApplicationTypeEnum;
}

const ApplyRoute: FC<Props> = ({ paths, type }) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <RestrictedRoute path={`${path}`}>
        <ApplyPage paths={paths} type={type} />
      </RestrictedRoute>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default ApplyRoute;
