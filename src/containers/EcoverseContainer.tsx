import React from 'react';
import { Col, Row } from 'react-bootstrap';
import ChallengeList from '../components/ChallengeList';
import ChallengeProfile from '../components/ChallengeProfile';
import EcoverseProfile from '../components/EcoverseProfile';

const EcoverseContainer = (): JSX.Element => {
  const [id, setId] = React.useState(2);
  const handleIdChange = React.useCallback(newId => {
    setId(newId);
  }, []);

  return (
    <div className="container-fluid">
      <Row>
        <Col sm={2}>
          <EcoverseProfile />
        </Col>
        <Col sm={2}>
          <ChallengeList handleIdChange={handleIdChange} />
        </Col>
        <Col>
          <ChallengeProfile id={id} />
        </Col>
      </Row>
    </div>
  );
};

export default EcoverseContainer;
