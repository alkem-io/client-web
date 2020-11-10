import React, { FC } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';

type AdminPageProps = PageProps;

// const adminPageData = [
//   {
//     name: 'Users',
//     path: '/users',
//     description: 'Edit users',
//   },
//   {
//     name: 'Groups',
//     path: '/groups',
//     description: 'Edit user groups',
//   },
// ];

export const AdminPage: FC<AdminPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });
  //const styles = useCardStyles();

  const { url } = useRouteMatch();
  return (
    <>
      <Nav className="justify-content-center" defaultActiveKey="admin">
        <Nav.Link as={Link} to="/admin/users" eventKey="users">
          Users
        </Nav.Link>
        <Nav.Link as={Link} to="/admin/groups" eventKey="groups">
          Groups
        </Nav.Link>
      </Nav>
    </>
  );
};
export default AdminPage;
