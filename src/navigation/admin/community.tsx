import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { ListPage } from '../../components/Admin';
import ApplicationPage from '../../components/Admin/Community/ApplicationPage';
import CommunityPage from '../../components/Admin/Community/CommunityPage';
import { WithCommunity, WithParentMembersProps } from '../../components/Admin/Community/CommunityTypes';
import { CreateCommunityGroup } from '../../components/Admin/Community/CreateCommunityGroup';
import { SearchableListItem } from '../../components/Admin/SearchableList';
import { FourOuFour } from '../../pages';
import { GroupRoute } from './group';

interface CommunityRouteProps extends WithParentMembersProps, WithCommunity {}

export const CommunityRoute: FC<CommunityRouteProps> = ({ paths, community, parentMembers }) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/members`}>
        <CommunityPage paths={paths} parentMembers={parentMembers} community={community} />
      </Route>
      <Route path={`${path}/groups`}>
        <CommunityGroupsRoute paths={paths} community={community} parentMembers={parentMembers} />
      </Route>
      <Route path={`${path}/applications`}>
        <ApplicationPage paths={paths} />
      </Route>
    </Switch>
  );
};

export const CommunityGroupsRoute: FC<CommunityRouteProps> = ({ paths, community, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);

  const handleDelete = (item: SearchableListItem) => console.log(item);

  const groupsList = community?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` })) || [];

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage
          data={groupsList || []}
          paths={currentPaths}
          title={community ? `${community?.displayName} Groups` : 'Groups'}
          newLink={`${url}/new`}
          onDelete={handleDelete}
        />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateCommunityGroup paths={currentPaths} community={community} />
      </Route>
      <Route path={`${path}/:groupId`}>
        <GroupRoute paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
