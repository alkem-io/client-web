import React, { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { User } from '../../generated/graphql';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import Button from '../core/Button';
import UserList from './UserList';

interface UserPageProps extends PageProps {
  users: User[];
}

export const UserPage: FC<UserPageProps> = ({ paths, users }) => {
  const { path, url } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  const title = 'Users';

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
          <UserList users={users} />
        </Col>
      </Row>
    </>
  );
};
export default UserPage;
