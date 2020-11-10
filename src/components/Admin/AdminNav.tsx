import React, { FC } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const AdminNav: FC = () => {
  return (
    <>
      <Nav className="justify-content-center" defaultActiveKey="admin">
        <Nav.Link as={Link} to="/admin" eventKey="admin">
          Admin
        </Nav.Link>
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

export default AdminNav;
