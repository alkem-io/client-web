import generator from 'generate-password';
import gql from 'graphql-tag';
import React, { FC, FormEvent, useState } from 'react';
import { Alert, Button, Col, Form, FormControl } from 'react-bootstrap';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import { useCreateUserMutation, useUpdateUserMutation } from '../../generated/graphql';
import { defaultUser, UserModel } from '../../models/User';
import InputWithCopy from './InputWithCopy';

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

export const UserInput: FC<UserProps> = ({ users, editMode = EditMode.readOnly, onSave: _onSave }) => {
  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [strongPassword, setStronPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const { userId } = useParams<Parameters>();
  const foundUser = users.find(u => u.id === userId);

  const [createUser, { loading: mutationLoading }] = useCreateUserMutation({
    onError: error => {
      setShowError(true);
      console.log(error);
    },
    onCompleted: data => {
      history.replace(`/admin/users/${data.createUser.id}/edit`);
      setIsBlocked(true);
      setShowSuccess(true);
    },
    update: (cache, { data }) => {
      if (data) {
        const { createUser } = data;

        cache.modify({
          fields: {
            users(existingTodos = []) {
              const newUserRef = cache.writeFragment({
                data: createUser,
                fragment: gql`
                  fragment NewUser on User {
                    id
                    name
                    firstName
                    lastName
                    email
                    phone
                    city
                    country
                    gender
                  }
                `,
              });
              return [...existingTodos, newUserRef];
            },
          },
        });
      }
    },
  });

  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => setShowSuccess(true),
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    e.preventDefault();
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    const { id, ...newUser } = user;

    if (editMode === EditMode.new) {
      const aadPassword = generator.generate({
        length: 24,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true,
        strict: true,
      });

      newUser.aadPassword = aadPassword;
      setStronPassword(aadPassword);
      createUser({
        variables: {
          user: newUser,
        },
      });
    } else if (editMode === EditMode.edit) {
      const { email: _email, ...userToUpdate } = newUser;

      updateUser({
        variables: {
          userId: Number(id),
          user: userToUpdate,
        },
      });
    }
  };

  const handleBack = () => history.push('/admin/users');

  const backButton = editMode ? (
    <Button variant="secondary" onClick={handleBack}>
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
        <Prompt
          when={isBlocked}
          message={() =>
            'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!'
          }
        />
        <Alert show={showError} variant="danger" onClose={() => setShowError(false)} dismissible>
          Error saving user.
        </Alert>
        <Alert show={showSuccess} variant="success" onClose={() => setShowSuccess(false)} dismissible>
          Saved successfully.
        </Alert>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} controlId="userName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="name"
                placeholder="Full Name"
                value={user.name}
                required
                onChange={handleChange}
                readOnly={editMode === EditMode.readOnly}
              />
              <Form.Control.Feedback type="invalid">Please provide Full Name.</Form.Control.Feedback>
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
                readOnly={editMode === EditMode.readOnly}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <FormControl
                name="lastName"
                placeholder="Last name"
                value={user.lastName}
                onChange={handleChange}
                readOnly={editMode === EditMode.readOnly}
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                name="email"
                type="email"
                placeholder="Email"
                value={user?.email}
                onChange={handleChange}
                readOnly={editMode === EditMode.readOnly || editMode === EditMode.edit}
              />
              <Form.Control.Feedback type="invalid">Please provide e-mail.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col}>
              {isBlocked && <InputWithCopy label="Generated Password" text={strongPassword} />}
              <FormControl.Feedback type="invalid">Test</FormControl.Feedback>
            </Form.Group>
          </Form.Row>
          <Alert show={isBlocked} variant="warning">
            Please copy the "Generated password". Once form is closed it will be lost forever.
          </Alert>
          <Form.Group>
            <Form.Label> </Form.Label>
            {editMode !== EditMode.readOnly && (
              <>
                <Button variant="primary" type="submit">
                  Save
                </Button>{' '}
              </>
            )}
            {backButton}
            {(mutationLoading || updateMutationLoading) && <div>Saving...</div>}
          </Form.Group>
        </Form>
      </>
    );
  }
};
export default UserInput;
