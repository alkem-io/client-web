import React, { FC } from 'react';
import { Col, Nav, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ErrorHandler } from '../../containers/ErrorHandler';
import Header from '../Header';

export const AdminLayout: FC = ({ children }) => {
  return (
    <>
      <Header />
      <ErrorHandler>
        <Row>
          <Col sm={1} className="ct-nav">
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/admin/users">
                Users
              </Nav.Link>
            </Nav>
          </Col>
          <Col className={'mt-5'}>{children ? children : <div></div>}</Col>
        </Row>
      </ErrorHandler>
    </>
  );
};

export default AdminLayout;
