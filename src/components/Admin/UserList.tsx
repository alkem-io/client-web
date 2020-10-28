import React, { FC } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { Link, useRouteMatch } from 'react-router-dom';
import { UserModel } from '../../models/User';

interface UserListProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users }) => {
  const { path } = useRouteMatch();
  return (
    <>
      <Row>
        <Col>
          <ListGroup>
            {users.map(u => (
              <ListGroup.Item as={Link} action key={u.id} to={`${path}/${u.id}/edit`}>
                {u.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </>
  );
};
export default UserList;
