import React, { FC } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useUsersQuery } from '../../generated/graphql';
import { defaultUser, UserModel } from '../../models/User';
import User from './User';
import UserForm, { EditMode } from './UserForm';
import UserList from './UserList';

export const UserPage: FC = () => {
  const { data, loading } = useUsersQuery();
  const users = (data?.users || []) as UserModel[];
  const { path } = useRouteMatch();

  const handleSaveUser = (_user: UserModel) => {
    console.log('Saving...');
  };

  console.log('UserPage: ', path);
  const title = 'Users';
  return (
    <>
      <Row className="justify-content-end">
        <Col>
          <h2 style={{ textAlign: 'center' }}>{title}</h2>
        </Col>
        <Col sm={1}>
          <Link to={`${path}/new`}>
            <Button>
              <span>New</span>
            </Button>
          </Link>
        </Col>
      </Row>
      <hr />
      {loading ? (
        <h3>Loading...</h3>
      ) : (
        <Row>
          <Col>
            <Switch>
              <Route exact path={`${path}`}>
                <UserList users={users} />
              </Route>
              <Route path={`${path}/users/new`}>
                <UserForm user={defaultUser} editMode={EditMode.new} title={'User creation'} />
              </Route>
              <Route exact path={`${path}/users/:userId/edit`}>
                <User mode={EditMode.edit} />
              </Route>
              <Route exact path={`${path}/users/:userId`}>
                <User mode={EditMode.readOnly} />
              </Route>
            </Switch>
          </Col>
        </Row>
      )}
    </>
  );
};
export default UserPage;
