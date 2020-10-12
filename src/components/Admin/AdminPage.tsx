import React, { FC } from 'react';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import Switch from 'react-bootstrap/esm/Switch';
import { Route, useRouteMatch } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { User } from './User';

export const users = [
  {
    id: '1',
    name: 'john',
    email: '',
  },
  {
    id: '2',
    name: 'bob',
    email: 'admin@cherrytwist.org',
  },
  {
    id: '3',
    name: 'Angel',
    email: 'angel@cmd.bg',
  },
  {
    id: '4',
    name: 'Valentin',
    email: 'valentin_yanakiev@yahoo.co.uk',
  },
  {
    id: '5',
    name: 'Neil',
    email: 'neil@cherrytwist.org',
  },
];

export const AdminPage: FC = () => {
  const { path, url } = useRouteMatch();
  console.log('Url: ', url);
  console.log('Path: ', path);
  return (
    <AdminLayout>
      <Container>
        <h1>Admin Page</h1>

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
                <User />
              </Route>
            </Switch>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};
