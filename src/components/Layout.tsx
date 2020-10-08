import React, { FC } from 'react';
import { Col, Nav, Row } from 'react-bootstrap';
import Header from './Header';

export const Layout: FC = ({ children }) => {
  return (
    <>
      <Header userName="" />
      <Row>
        <Col sm={1}>
          <Nav className="flex-column">
            <Nav.Link href="/challenge">Challange</Nav.Link>
            <Nav.Link href="/connect">Connect</Nav.Link>
            <Nav.Link href="/messages">Messages</Nav.Link>
            <Nav.Link href="/explore">Explore</Nav.Link>
          </Nav>
        </Col>
        <Col>{children ? children : <div></div>}</Col>
      </Row>
    </>
  );
};
