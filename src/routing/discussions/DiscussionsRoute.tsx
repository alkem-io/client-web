import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { DiscussionProvider } from '../../context/Discussions/DiscussionProvider';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { useConfig } from '../../hooks';
import { FEATURE_COMMUNICATIONS_DISCUSSIONS } from '../../models/constants';
import { Error404, PageProps } from '../../pages';
import DiscussionListPage from '../../pages/Discussions/DiscussionListPage';
import DiscussionPage from '../../pages/Discussions/DiscussionPage';
import NewDiscussionPage from '../../pages/Discussions/NewDiscussionPage';
import { nameOfUrl } from '../url-params';

interface DiscussionsRouteProps extends PageProps {}

export const DiscussionsRoute: FC<DiscussionsRouteProps> = () => {
  const { path } = useRouteMatch();

  const { isFeatureEnabled } = useConfig();

  if (!isFeatureEnabled(FEATURE_COMMUNICATIONS_DISCUSSIONS)) return <Error404 />;

  return (
    <DiscussionsProvider>
      <Switch>
        <Route exact path={path}>
          <DiscussionListPage />
        </Route>
        <Route exact path={`${path}/new`}>
          <NewDiscussionPage />
        </Route>
        <Route path={`${path}/:${nameOfUrl.discussionId}`}>
          <DiscussionProvider>
            <DiscussionPage />
          </DiscussionProvider>
        </Route>
        <Route path="*">
          <Error404 />
        </Route>
      </Switch>
    </DiscussionsProvider>
  );
};
export default DiscussionsRoute;
