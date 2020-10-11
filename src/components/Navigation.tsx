import React, { FC, useContext } from 'react';
import Accordion from 'react-bootstrap/esm/Accordion';
import Nav from 'react-bootstrap/esm/Nav';
import { appContext } from '../context/AppProvider';

export const Navigation: FC = () => {
  const context = useContext(appContext);

  return (
    <Nav className="flex-column">
      <Nav.Link href="/">{context.ecoverse.name}</Nav.Link>
      <Accordion defaultActiveKey="0">
        <Accordion.Toggle as={Nav.Link} variant="light" eventKey="0">
          Challange
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <div style={{ marginLeft: '10px' }}>
            <Nav.Link href="/governance">Governance</Nav.Link>
            <Nav.Link href="/projects">Projects</Nav.Link>
            <Nav.Link href="/agreements">Agreements</Nav.Link>
          </div>
        </Accordion.Collapse>
      </Accordion>

      <Nav.Link href="/connect">Connect</Nav.Link>
      <Nav.Link href="/messages">Messages</Nav.Link>
      <Nav.Link href="/explore">Explore</Nav.Link>
    </Nav>
  );
};

export default Navigation;
