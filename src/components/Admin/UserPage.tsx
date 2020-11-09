import React, { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
import { UserModel } from '../../models/User';
import Button from '../core/Button';
import Loading from '../core/Loading';
import UserEdit from './UserEdit';
import { EditMode } from './UserForm';
import UserList from './UserList';

export const UserPage: FC = () => {
  const { path } = useRouteMatch();
  const { data, loading } = useUsersQuery();

  const users = (data?.users || []) as UserModel[];

  const title = 'Users';

  if (loading) return <Loading />;

  return (
    <>
      <Row className="justify-content-end">
        <Col sm={1}>
          <Link to={`${path}/new`}>
            <Button variant="primary" small>
              New
            </Button>
          </Link>
        </Col>
        <Col>
          <h2 style={{ textAlign: 'center' }}>{title}</h2>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <Switch>
            <Route exact path={`${path}`}>
              <UserList users={users} />
            </Route>
            <Route path={`${path}/new`}>
              <UserEdit editMode={EditMode.new} />
            </Route>
            <Route exact path={`${path}/:userId/edit`}>
              <UserEdit editMode={EditMode.edit} />
            </Route>
            <Route exact path={`${path}/:userId`}>
              <UserEdit editMode={EditMode.readOnly} />
            </Route>
          </Switch>
        </Col>
      </Row>
    </>
  );
};
export default UserPage;
