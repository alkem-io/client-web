import React, { FC, FormEvent, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import { Alert, Button, Col, Form, FormControl, DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap';
import generator from 'generate-password';
import { Formik } from 'formik';
import * as yup from 'yup';

import InputWithCopy from './InputWithCopy';

import gql from 'graphql-tag';
import { useCreateUserMutation, useUpdateUserMutation } from '../../generated/graphql';
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
  users: Array<UserModel>;
  editMode?: EditMode;
  onSave?: (user: UserModel) => void;
}
interface UserFrom {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  gender: string;
  avatar?: string;
}

export const UserInput: FC<UserProps> = ({ users, editMode = EditMode.readOnly, onSave: _onSave }) => {
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [strongPassword, setStrongPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);

  const history = useHistory();
  const { userId } = useParams<Parameters>();

  const currentUser = users.find(u => u.id === userId) || defaultUser;
  const { name, firstName, lastName, email, city, gender, phone, country } = currentUser;

  const initialValues: UserFrom = {
    name: name || '',
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    gender: gender || '',
    city: city || '',
    country: country || '',
    phone: phone || '',
    avatar: '',
  };

  const validationSchema: yup.ObjectSchema<UserFrom | undefined> = yup.object().shape({
    name: yup.string().required('This is the required field'),
    firstName: yup.string().required('This is the required field'),
    lastName: yup.string().required('This is the required field'),
    email: yup.string().email('Email is not valid').required('This is the required field'),
    gender: yup.string(),
    city: yup.string(),
    country: yup.string(),
    phone: yup.string(),
    avatar: yup.string(),
  });

  const genders = ['not specified', 'male', 'female'];

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
    ...currentUser,
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

  const handleSubmit = (values: UserFrom) => {
    // const form = e.currentTarget;
    // console.log('form --->', form);
    // e.preventDefault();
    // if (!form.checkValidity()) {
    //   setValidated(true);
    //   return;
    // }
    const { id, ...newUser } = user;

    console.log('values ---> ', values);
    /*if (editMode === EditMode.new) {
      const aadPassword = generator.generate({
        length: 24,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true,
        strict: true,
      });

      newUser.aadPassword = aadPassword;
      setStrongPassword(aadPassword);
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
    }*/
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

  if (!currentUser && editMode !== EditMode.new) {
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
        <h2>User</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => handleSubmit(values)}
        >
          {({ values, handleChange, handleSubmit, handleBlur, isValid, errors }) => (
            <Form noValidate>
              <Form.Row>
                <Form.Group as={Col} controlId="userName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    name="name"
                    placeholder="Full Name"
                    value={values.name}
                    onChange={handleChange}
                    required
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
                    value={values.firstName}
                    onChange={handleChange}
                    readOnly={editMode === EditMode.readOnly}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <FormControl
                    name="lastName"
                    placeholder="Last name"
                    value={values.lastName}
                    onChange={handleChange}
                    readOnly={editMode === EditMode.readOnly}
                  />
                  {console.log('errors ---> ', errors.lastName)}
                  <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
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
                    value={values?.email}
                    onChange={handleChange}
                    disabled={true}
                    readOnly={editMode === EditMode.readOnly || editMode === EditMode.edit}
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>Gender</Form.Label>
                  <Form.Control as={'select'} onChange={handleChange} name={'gender'}>
                    {genders.map(el => (
                      <option key={el}>{el}</option>
                    ))}
                  </Form.Control>
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
                    <Button variant="primary" onClick={() => handleSubmit()}>
                      Save
                    </Button>{' '}
                    <Button variant="primary" onClick={() => console.log(values)}>
                      values
                    </Button>{' '}
                  </>
                )}
                {backButton}
                {(mutationLoading || updateMutationLoading) && <div>Saving...</div>}
              </Form.Group>
            </Form>
          )}
        </Formik>
        {/*<Form noValidate onSubmit={handleSubmit}>
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
                disabled={true}
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
        </Form>*/}
      </>
    );
  }
};
export default UserInput;
