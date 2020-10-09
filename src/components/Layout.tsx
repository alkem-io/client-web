import React, { FC } from 'react';
import { Col, ProgressBar, Row } from 'react-bootstrap';
import { ErrorHandler } from '../containers/ErrorHandler';
import { useEcoverseListQuery } from '../generated/graphql';
import Header from './Header';
import Navigation from './Navigation';

export const Layout: FC = ({ children }) => {
  const challenges = [
    { id: 1, name: 'Challenge 1' },
    { id: 2, name: 'Challenge 2' },
    { id: 3, name: 'Challenge 4' },
  ];

  const { data } = useEcoverseListQuery();

  const ecoverse = data ? data.name : '';
  return (
    <>
      <Header userName="Pesho" />
      <ErrorHandler>
        <ProgressBar now={60} style={{ height: '1px' }} />
        <Row>
          <Col sm={1} className="ct-nav">
            <Navigation ecoverse={ecoverse} challenges={challenges} />
          </Col>
          <Col>{children ? children : <div></div>}</Col>
        </Row>
      </ErrorHandler>
    </>
  );
};

export default Layout;
