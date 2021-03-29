import React, { FC, useMemo } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { GroupPage, ListPage } from '../../components/Admin';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import { SearchableListItem } from '../../components/Admin/SearchableList';
import { CommunityDetailsFragment } from '../../generated/graphql';
import { FourOuFour } from '../../pages';
import { WithParentMembersProps } from './admin';

interface CommunityRouteProps extends WithParentMembersProps {
  community?: CommunityDetailsFragment;
}

export const CommunityRoute: FC<CommunityRouteProps> = ({ paths, community, parentMembers }) => {
  const { path, url } = useRouteMatch();

  const groupId = community?.groups?.find(g => g.name.toLowerCase() === 'members')?.id || '';
  console.log('Path: ', path);
  console.log('Url: ', url);
  return (
    <Switch>
      <Route exact path={`${path}/members`}>
        <Redirect to={`${url}/groups/${groupId}`} />
      </Route>
      <Route path={`${path}/groups`}>
        <CommunityGroupsRoute paths={paths} community={community} parentMembers={parentMembers} />
      </Route>
      <Route path={`${path}/applications`}>
        <div>Applications</div>
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
          title={community ? `${community?.name} Groups` : 'Groups'}
          newLink={`${url}/new`}
          onDelete={handleDelete}
        />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateGroupPage action={'createCommunityGroup'} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
