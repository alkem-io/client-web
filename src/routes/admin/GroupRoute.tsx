import React, { FC, useMemo } from 'react';
import Loading from '../../components/core/Loading';
import { Route, Switch } from 'react-router-dom';
import EditMembersPage from '../../components/Admin/Group/EditMembersPage';
import { FourOuFour } from '../../pages';
import { UserGroup } from '../../types/graphql-schema';
import { Member } from '../../models/User';
import { Path } from '../../context/NavigationProvider';
import GroupPage from '../../components/Admin/Group/GroupPage';

interface Props {
  paths: Path[];
  path: string;
  url: string;
  group?: UserGroup;
  loading?: boolean;
  parentMembers: Member[];
}

export const GroupRoute: FC<Props> = ({ paths, path, url, group, loading, parentMembers }) => {
  const groupName = group?.name || '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: groupName, real: true }], [paths, groupName]);

  if (loading) return <Loading text={'Loading group'} />;

  return (
    <Switch>
      <Route exact path={path}>
        <GroupPage paths={paths} group={group} />
      </Route>
      <Route exact path={`${path}/members`}>
        <EditMembersPage paths={currentPaths} parentMembers={parentMembers} groupId={group?.id || ''} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
