import React, { FC } from 'react';
import { Col, Nav, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ErrorHandler } from '../../containers/ErrorHandler';
import Container from '../core/Container';

export const AdminLayout: FC = ({ children }) => {
  return (
    <>
      <Container>
        <ErrorHandler>
          <Row>
            <Col sm={1} className="ct-nav">
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/admin">
                  Admin
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users">
                  Users
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/groups">
                  Groups
                </Nav.Link>
              </Nav>
            </Col>
            <Col>{children ? children : <div></div>}</Col>
          </Row>
        </ErrorHandler>
      </Container>
    </>
  );
};

export default AdminLayout;
