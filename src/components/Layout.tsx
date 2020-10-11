import React, { FC } from 'react';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import { ErrorHandler } from '../containers/ErrorHandler';
import Header from './Header';
import Navigation from './Navigation';

export const Layout: FC = ({ children }) => {
  return (
    <>
      <Header userName="Pesho" />
      <ErrorHandler>
        <ProgressBar now={60} style={{ height: '1px' }} />
        <Row>
          <Col sm={1} className="ct-nav">
            <Navigation />
          </Col>
          <Col>{children ? children : <div></div>}</Col>
        </Row>
      </ErrorHandler>
    </>
  );
};

export default Layout;
