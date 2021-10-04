import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { CommunityCredentials } from '../../components/Admin/Authorization/EditCommunityMembers';
import CommunityPage from '../../components/Admin/Community/CommunityPage';
import { WithCommunity } from '../../components/Admin/Community/CommunityTypes';
import { CreateCommunityGroup } from '../../components/Admin/Community/CreateCommunityGroup';
import LeadingOrganizationPage from '../../components/Admin/Community/LeadingOrganizationPage';
import { FourOuFour, PageProps } from '../../pages';
import CommunityGroupListPage from '../../pages/Admin/Community/CommunityListPage';
import CommunityUpdatesPage from '../../pages/Admin/Community/CommunityUpdatesPage';
import { nameOfUrl } from '../url-params';
import { ChallengeApplicationRoute } from './challenge/ChallengeApplicationRoute';
import { EcoverseApplicationRoute } from './ecoverse/EcoverseApplicationRoute';
import { EcoverseGroupRoute } from './ecoverse/EcoverseGroupRoute';

type AccessedFrom = 'ecoverse' | 'challenge' | 'opportunity';

interface CommunityRouteProps extends PageProps, WithCommunity {
  credential: CommunityCredentials;
  resourceId: string;
  accessedFrom: AccessedFrom;
}

export const CommunityRoute: FC<CommunityRouteProps> = ({
  paths,
  communityId,
  parentCommunityId,
  credential,
  resourceId,
  accessedFrom,
}) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/members`}>
        <CommunityPage
          paths={paths}
          credential={credential}
          resourceId={resourceId}
          communityId={communityId}
          parentCommunityId={parentCommunityId}
        />
      </Route>
      <Route path={`${path}/groups`}>
        <CommunityGroupsRoute paths={paths} communityId={communityId} parentCommunityId={parentCommunityId} />
      </Route>
      <Route path={`${path}/applications`}>
        {accessedFrom === 'ecoverse' && <EcoverseApplicationRoute paths={paths} />}
        {accessedFrom === 'challenge' && <ChallengeApplicationRoute paths={paths} />}
      </Route>
      <Route path={`${path}/updates`}>
        <CommunityUpdatesPage paths={paths} communityId={communityId} />
      </Route>
      <Route path={`${path}/lead`}>
        <LeadingOrganizationPage paths={paths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface CommunityGroupsRouteProps extends PageProps, WithCommunity {}

export const CommunityGroupsRoute: FC<CommunityGroupsRouteProps> = ({ paths, communityId, parentCommunityId }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <CommunityGroupListPage communityId={communityId || ''} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateCommunityGroup paths={currentPaths} communityId={communityId} />
      </Route>
      <Route path={`${path}/:${nameOfUrl.groupId}`}>
        <EcoverseGroupRoute paths={currentPaths} parentCommunityId={parentCommunityId} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
