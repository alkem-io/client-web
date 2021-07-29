import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { ListPage } from '../../components/Admin';
import { CommunityCredentials } from '../../components/Admin/Authorization/EditCommunityCredentials';
import CommunityPage from '../../components/Admin/Community/CommunityPage';
import { WithCommunity, WithParentMembersProps } from '../../components/Admin/Community/CommunityTypes';
import { CreateCommunityGroup } from '../../components/Admin/Community/CreateCommunityGroup';
import LeadingOrganisationPage from '../../components/Admin/Community/LeadingOrganisationPage';
import { useDeleteUserGroup } from '../../hooks';
import { FourOuFour } from '../../pages';
import { ChallengeApplicationRoute } from './challenge/ChallengeApplicationRoute';
import { EcoverseApplicationRoute } from './ecoverse/EcoverseApplicationRoute';
import { EcoverseGroupRoute } from './ecoverse/EcoverseGroupRoute';

type AccessedFrom = 'ecoverse' | 'challenge' | 'opportunity';

interface CommunityRouteProps extends WithParentMembersProps, WithCommunity {
  credential: CommunityCredentials;
  resourceId: string;
  accessedFrom: AccessedFrom;
}

export const CommunityRoute: FC<CommunityRouteProps> = ({
  paths,
  community,
  parentMembers,
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
          parentMembers={parentMembers}
          credential={credential}
          resourceId={resourceId}
          community={community}
        />
      </Route>
      <Route path={`${path}/groups`}>
        <CommunityGroupsRoute paths={paths} community={community} parentMembers={parentMembers} />
      </Route>
      <Route path={`${path}/applications`}>
        {accessedFrom === 'ecoverse' && <EcoverseApplicationRoute paths={paths} />}
        {accessedFrom === 'challenge' && <ChallengeApplicationRoute paths={paths} />}
      </Route>
      <Route path={`${path}/lead`}>
        <LeadingOrganisationPage paths={paths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};

interface CommunityGroupsRouteProps extends WithParentMembersProps, WithCommunity {}

export const CommunityGroupsRoute: FC<CommunityGroupsRouteProps> = ({ paths, community, parentMembers }) => {
  const { path, url } = useRouteMatch();

  const { handleDelete } = useDeleteUserGroup();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths, url]);

  const groupsList = community?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` })) || [];

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage
          data={groupsList}
          paths={currentPaths}
          title={community ? `${community?.displayName} Groups` : 'Groups'}
          onDelete={x => handleDelete(x.id)}
          newLink={`${url}/new`}
        />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateCommunityGroup paths={currentPaths} community={community} />
      </Route>
      <Route path={`${path}/:groupId`}>
        <EcoverseGroupRoute paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
