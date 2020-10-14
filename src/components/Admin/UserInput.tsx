import React, { FC, FormEvent, useState } from 'react';
import { Alert, Button, Col, Form, FormControl } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router-dom';
import { useCreateUserMutation } from '../../generated/graphql';
import { defaultUser, UserModel } from '../../models/User';
// import { ReactComponent as Pencil } from 'bootstrap-icons/icons/pencil.svg';

interface Parameters {
  userId: string;
}
export enum EditMode {
  readOnly,
  edit,
  new,
}
interface UserProps {
  users: UserModel[];
  editMode?: EditMode;
  onSave?: (user: UserModel) => void;
}

export const UserInput: FC<UserProps> = ({ users, editMode = EditMode.readOnly, onSave }) => {
  const history = useHistory();
  const { userId } = useParams<Parameters>();
  const foundUser = users.find(u => u.id === userId);

  const [createUser, { loading: mutationLoading, error: mutationError }] = useCreateUserMutation({
    onError: error => console.log(error),
  });
  const [user, setUser] = useState<UserModel>({
    ...defaultUser,
    ...foundUser,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setUser(u => {
      return {
        ...u,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e: FormEvent<HTMLElement>) => {
    console.log(user);

    e.preventDefault();
    const { id: _id, ...newUser } = user;
    createUser({
      variables: {
        user: newUser,
      },
    });
    // if (onSave) onSave(user);
  };

  const handleBack = () => history.push('/admin/users');

  const backButton = editMode ? (
    <Button variant="light" onClick={handleBack}>
      Cancel
    </Button>
  ) : (
    <Button variant="primary" onClick={handleBack}>
      Back
    </Button>
  );

  if (!foundUser && editMode !== EditMode.new) {
    return (
      <>
        <div>User not found!</div>
        {backButton}
      </>
    );
  } else {
    return (
      <>
        {mutationError && (
          <>
            <Alert variant="danger">Error saving user!</Alert>
          </>
        )}
        <h2>User</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} controlId="userName">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                name="name"
                placeholder="User name"
                value={user.name}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                placeholder="First name"
                value={user.firstName}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <FormControl
                name="lastName"
                placeholder="Last name"
                value={user.lastName}
                onChange={handleChange}
                readOnly={!editMode}
              />
            </Form.Group>
          </Form.Row>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Email"
              value={user?.email}
              onChange={handleChange}
              readOnly={!editMode}
            />
          </Form.Group>
          {editMode !== EditMode.readOnly && (
            <>
              <Button variant="primary" type="submit">
                Save
              </Button>{' '}
            </>
          )}
          {backButton}
          {mutationLoading && <div>Saving...</div>}
        </Form>
      </>
    );
  }
};
export default UserInput;
