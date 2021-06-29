import React, { FC, useMemo } from 'react';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { WithParentMembersProps } from '../../components/Admin/Community/CommunityTypes';
import EditMembersPage from '../../components/Admin/Group/EditMembersPage';
import GroupPage from '../../components/Admin/Group/GroupPage';
import Loading from '../../components/core/Loading';
import { useGroupQuery } from '../../generated/graphql';
import { FourOuFour } from '../../pages';
import { useEcoverse } from '../../hooks/useEcoverse';

interface GroupRouteProps extends WithParentMembersProps {}

interface GroupRouteParams {
  groupId: string;
}

export const GroupRoute: FC<GroupRouteProps> = ({ paths, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const { groupId } = useParams<GroupRouteParams>();
  const { ecoverseId } = useEcoverse();
  const { data, loading } = useGroupQuery({ variables: { ecoverseId, groupId } });
  const groupName = data?.ecoverse.group.name || '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: groupName, real: true }], [paths, data]);

  if (loading) return <Loading text={'Loading group'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <GroupPage paths={paths} />
      </Route>
      <Route exact path={`${path}/members`}>
        <EditMembersPage paths={currentPaths} parentMembers={parentMembers} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
