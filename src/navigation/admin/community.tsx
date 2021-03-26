import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { GroupPage, ListPage } from '../../components/Admin';
import MembersPage from '../../components/Admin/Community/MembersPage';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import { SearchableListItem } from '../../components/Admin/SearchableList';
import { CommunityDetailsFragment } from '../../generated/graphql';
import { Member } from '../../models/User';
import { FourOuFour, PageProps } from '../../pages';

interface CommunityPageProps extends PageProps {
  community?: CommunityDetailsFragment;
}
interface CommunityPropsRoute extends CommunityPageProps {
  parentMembers: Member[];
}

export const CommunityRoute: FC<CommunityPropsRoute> = ({ paths, community, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'Community', real: false }], [paths]);

  const groupId = community?.groups?.find(g => g.name.toLowerCase() === 'members')?.id || '';

  return (
    <Switch>
      <Route exact path={`${path}/members`}>
        <MembersPage paths={currentPaths} groupId={groupId} parentMembers={parentMembers} />
      </Route>
      <Route path={`${path}/groups`}>
        <CommunityGroupsRoute paths={currentPaths} community={community} />
      </Route>
      <Route exact path={`${path}/applications`}>
        <div>Applications</div>
      </Route>
    </Switch>
  );
};
export default CommunityRoute;

export const CommunityGroupsRoute: FC<CommunityPageProps> = ({ paths, community }) => {
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
        <GroupPage paths={currentPaths} parentMembers={[]} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
