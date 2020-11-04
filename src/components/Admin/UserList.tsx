import React, { FC } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { Link, useRouteMatch } from 'react-router-dom';
/*lib imports end*/

import { UserModel } from '../../models/User';
/*local files imports end*/

interface UserListProps {
  users: UserModel[];
}

export const UserList: FC<UserListProps> = ({ users }) => {
  const { path } = useRouteMatch();

  return (
    <>
      <Row className="justify-content-end">
        <Col sm={1}>
          <Link to={`${path}/new`}>
            <Button>
              <span>New</span>
            </Button>
          </Link>
        </Col>
      </Row>
      <ListGroup>
        {users.map(u => (
          <ListGroup.Item as={Link} action key={u.id} to={`${path}/${u.id}/edit`}>
            {u.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};
export default UserList;
