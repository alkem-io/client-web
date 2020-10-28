import React, { FC } from 'react';
import { Col, Container, Nav, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ErrorHandler } from '../../containers/ErrorHandler';
import Header from '../Header';

export const AdminLayout: FC = ({ children }) => {
  return (
    <>
      <Header />
      <Container fluid>
        <ErrorHandler>
          <Row>
            <Col sm={1} className="ct-nav">
              <Nav className="flex-column">
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
