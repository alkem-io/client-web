import React, { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ErrorHandler } from '../containers/ErrorHandler';
import Header from './Header';

export const AdminLayout: FC = ({ children }) => {
  return (
    <>
      <Header />
      <ErrorHandler>
        {/* <ProgressBar now={60} style={{ height: '1px' }} /> */}
        <Row>
          <Col sm={1} className="ct-nav"></Col>
          <Col>{children ? children : <div></div>}</Col>
        </Row>
      </ErrorHandler>
    </>
  );
};

export default AdminLayout;
