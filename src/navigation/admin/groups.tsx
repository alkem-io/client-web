import React, { FC, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import GroupPage from '../../components/Admin/Group/GroupPage';
import { ListPage } from '../../components/Admin/ListPage';
import Loading from '../../components/core/Loading';
import { useEcoverseGroupsListQuery } from '../../generated/graphql';
import { useRemoveUserGroup } from '../../hooks/useRemoveGroup';
import { FourOuFour, PageProps } from '../../pages';

export const GroupsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);

  const { data, loading } = useEcoverseGroupsListQuery();
  const {
    removeGroup,
    result: { loading: removingGroup },
  } = useRemoveUserGroup(['ecoverseGroupsList']);

  const groupsList = data?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` }));

  if (loading) return <Loading text={'Loading Groups ...'} />;
  return (
    <Switch>
      <Route exact path={`${path}`}>
        {removingGroup && 'Removing...'}
        <ListPage
          data={groupsList || []}
          paths={currentPaths}
          title={'Ecoverse groups'}
          newLink={`${url}/new`}
          onDelete={removeGroup}
        />
      </Route>
      <Route exact path={`${path}/new`}>
        <CreateGroupPage action={'createEcoverseGroup'} paths={currentPaths} />
      </Route>
      <Route exact path={`${path}/:groupId`}>
        <GroupPage paths={currentPaths} />
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
