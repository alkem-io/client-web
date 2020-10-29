import React, { FC } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useEcoverseChallengeGroupsQuery } from '../../generated/graphql';
import { mapChallenges } from '../../utils';
import GroupList from './GroupList';
import SearchableList from './SearchableList';

export const GroupPage: FC = () => {
  const { data, loading } = useEcoverseChallengeGroupsQuery();
  const match = useRouteMatch();
  const { path } = match;

  // const groups = ((data && data.groups) || []).map(g => ({ id: g.id, value: g.name }));
  const challenges = ((data && data.challenges) || []).map(mapChallenges);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <h2 style={{ textAlign: 'center' }}>Groups</h2>
        <hr />

        <Row>
          <Col sm={3}>
            <p>Challenges</p>
            <SearchableList data={challenges} url={`${path}`}>
              <ListGroup>
                <ListGroup.Item as={Link} action to={`${path}/ecoverse`}>
                  Ecoverse
                </ListGroup.Item>
              </ListGroup>
            </SearchableList>
          </Col>
          <Col sm={3}>
            <p>Groups</p>
            <Switch>
              <Route path={`${path}/ecoverse`}>
                <GroupList data={data} type="ecoverse" />
              </Route>
              <Route path={`${path}/:challengeId`}>
                <GroupList data={data} type="challenge" />
              </Route>
            </Switch>
          </Col>
          <Col>
            <p>Members</p>
            <Switch>
              <Route path={`${path}/ecoverse/:groupId`}>Ecoverse</Route>
              <Route path={`${path}/:challengeId/:groupId`}>Challenge</Route>
            </Switch>
          </Col>
        </Row>
      </>
    );
  }
};
export default GroupPage;
