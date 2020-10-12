import React, { FC } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { splitNames } from '../../utils/splitNames';
import { UserModel } from '../../models/User';

interface Parameters {
  userId: string;
}

interface UserProps {
  users: UserModel[];
}

export const User: FC<UserProps> = ({ users }) => {
  const { userId } = useParams<Parameters>();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return <div>User not found!</div>;
  } else {
    const { firstName, lastName } = splitNames(user?.name);
    return (
      <Form>
        <Form.Row>
          <Form.Group as={Col} controlId="formFirstName">
            <Form.Control placeholder="First name" value={firstName} readOnly />
          </Form.Group>
          <Form.Group as={Col} controlId="formLastName">
            <Form.Control placeholder="Last name" value={lastName} readOnly />
          </Form.Group>
        </Form.Row>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Email" value={user?.email} readOnly />
        </Form.Group>
      </Form>
    );
  }
};
export default User;
