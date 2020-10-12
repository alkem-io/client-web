import React, { FC } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { users } from './AdminPage';
import { splitNames } from '../../utils/splitNames';

interface Parameters {
  userId: string;
}
export const User: FC = () => {
  const { userId } = useParams<Parameters>();
  const user = users.find(u => u.id === userId);
  const { firstName, lastName } = splitNames(user?.name);
  return (
    <Form>
      <Form.Row>
        <Form.Group as={Col} controlId="formFirstName">
          <Form.Control placeholder="First name" value={firstName} />
        </Form.Group>
        <Form.Group as={Col} controlId="formLastName">
          <Form.Control placeholder="Last name" value={lastName} />
        </Form.Group>
      </Form.Row>
      <Form.Group controlId="formEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" placeholder="Email" value={user?.email} />
      </Form.Group>
    </Form>
  );
};
export default User;
