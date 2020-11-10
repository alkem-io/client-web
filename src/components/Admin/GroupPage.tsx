import React, { FC, useMemo } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useEcoverseChallengeGroupsQuery } from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import { mapChallenges } from '../../utils';
import Loading from '../core/Loading';
import GroupEdit from './GroupEdit';
import GroupList from './GroupList';
import SearchableList from './SearchableList';

type GroupPageProps = PageProps;

export const GroupPage: FC<GroupPageProps> = ({ paths }) => {
  const { data, loading } = useEcoverseChallengeGroupsQuery();
  const { path, url } = useRouteMatch();

  const currentPaths = useMemo(() => [...paths, { value: url, name: 'groups', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  // const groups = ((data && data.groups) || []).map(g => ({ id: g.id, value: g.name }));
  const challenges = ((data && data.challenges) || []).map(mapChallenges);

  if (loading) return <Loading />;

  return (
    <>
      <h2 style={{ textAlign: 'center' }}>Groups</h2>
      <hr />
      <Switch>
        <Route exact path={`${path}/ecoverse`}>
          <GroupList data={data} type="ecoverse" />
        </Route>
        <Route exact path={`${path}/ecoverse/:groupId`}>
          <GroupEdit />
        </Route>
        <Route exact path={`${path}/:challengeId/:groupId`}>
          <GroupEdit />
        </Route>
        <Route exact path={`${path}/:challengeId`}>
          <GroupList data={data} type="challenge" />
        </Route>
        <Route exact path={`${path}`}>
          <h3>Ecoverse/Challenges</h3>
          <SearchableList data={challenges} url={`${path}`}>
            <ListGroup>
              <ListGroup.Item as={Link} action to={`${path}/ecoverse`}>
                Ecoverse
              </ListGroup.Item>
            </ListGroup>
          </SearchableList>
        </Route>
      </Switch>
    </>
  );
};
export default GroupPage;
