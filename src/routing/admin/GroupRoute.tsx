import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { WithCommunity, WithOptionalMembersProps } from '../../components/Admin/Community/CommunityTypes';
import EditMembersPage from '../../components/Admin/Group/EditMembersPage';
import GroupPage from '../../components/Admin/Group/GroupPage';
import Loading from '../../components/core/Loading/Loading';
import { UserGroup } from '../../models/graphql-schema';
import { FourOuFour } from '../../pages';

interface Props extends WithOptionalMembersProps, WithCommunity {
  group?: UserGroup;
  loading?: boolean;
}

export const GroupRoute: FC<Props> = ({ paths, group, loading = false, parentCommunityId, parentMembers }) => {
  const { path, url } = useRouteMatch();
  const groupName = group?.name || '';

  const currentPaths = useMemo(() => [...paths, { value: url, name: groupName, real: true }], [paths, groupName]);

  if (loading) return <Loading text={'Loading group'} />;

  return (
    <Switch>
      <Route exact path={path}>
        <GroupPage paths={paths} group={group} />
      </Route>
      <Route exact path={`${path}/members`}>
        <EditMembersPage
          paths={currentPaths}
          parentCommunityId={parentCommunityId}
          groupId={group?.id || ''}
          parentMembers={parentMembers}
        />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
