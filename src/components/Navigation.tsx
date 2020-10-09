import React, { FC } from 'react';
import Accordion from 'react-bootstrap/esm/Accordion';
import Nav from 'react-bootstrap/esm/Nav';

export interface NavigationProps {
  ecoverse: string;
  challenges: {
    id: number;
    name: string;
  }[];
}

export const Navigation: FC<NavigationProps> = ({ ecoverse, challenges }) => {
  const mapped = challenges.map(x => (
    <Nav.Link key={x.name} href={`/challenge/${x.id}`}>
      {x.name}
    </Nav.Link>
  ));

  return (
    <Nav className="flex-column">
      <Nav.Link href="/">{ecoverse}</Nav.Link>
      <Accordion defaultActiveKey="0">
        <Accordion.Toggle as={Nav.Link} variant="light" eventKey="0">
          Challanges
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <div style={{ marginLeft: '10px' }}>{mapped}</div>
        </Accordion.Collapse>
      </Accordion>

      <Nav.Link href="/connect">Connect</Nav.Link>
      <Nav.Link href="/messages">Messages</Nav.Link>
      <Nav.Link href="/explore">Explore</Nav.Link>
    </Nav>
  );
};

export default Navigation;
