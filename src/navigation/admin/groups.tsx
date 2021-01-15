import React, { FC, useMemo } from 'react';
import { FourOuFour, PageProps } from '../../pages';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useEcoverseGroupsListQuery } from '../../generated/graphql';
import Loading from '../../components/core/Loading';
import { ListPage } from '../../components/Admin/ListPage';
import CreateGroupPage from '../../components/Admin/Group/CreateGroupPage';
import GroupPage from '../../components/Admin/Group/GroupPage';

export const GroupsRoute: FC<PageProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useEcoverseGroupsListQuery();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);
  const groupsList = data?.groups?.map(u => ({ id: u.id, value: u.name, url: `${url}/${u.id}` }));

  if (loading) return <Loading text={'Loading Groups ...'} />;

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <ListPage data={groupsList || []} paths={currentPaths} title={'Ecoverse groups'} newLink={`${url}/new`} />
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
