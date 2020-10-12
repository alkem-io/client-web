import React, { FC } from 'react';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import Switch from 'react-bootstrap/esm/Switch';
import { Route, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
import { UserModel } from '../../models/User';
import AdminLayout from './AdminLayout';
import { User } from './User';

export const AdminPage: FC = () => {
  const { path, url } = useRouteMatch();
  const { data, loading } = useUsersQuery();

  const users = (data?.users || []) as UserModel[];

  return (
    <AdminLayout>
      <Container>
        <h1>Admin Page</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <Row>
            <Col sm={2}>
              <ListGroup>
                {users.map(u => (
                  <ListGroup.Item action key={u.id} href={`${url}/user/${u.id}`}>
                    {u.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <Col>
              <Switch>
                <Route path={`${path}/user/:userId`}>
                  <User users={users} />
                </Route>
              </Switch>
            </Col>
          </Row>
        )}
      </Container>
    </AdminLayout>
  );
};
