import React, { FC } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useEcoverseChallengeGroupsQuery } from '../../generated/graphql';
import { mapChallenges } from '../../utils';
import GroupEdit from './GroupEdit';
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
          </Col>
        </Row>
      </>
    );
  }
};
export default GroupPage;
