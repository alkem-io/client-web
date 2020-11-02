import React, { FC, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router-dom';
import { Alert, Button, Col, Form, FormControl } from 'react-bootstrap';
import generator from 'generate-password';
import { Formik } from 'formik';
import * as yup from 'yup';
/*lib imports end*/

import InputWithCopy from './InputWithCopy';
/*components imports end*/

import gql from 'graphql-tag';
import { useCreateUserMutation, useUpdateUserMutation } from '../../generated/graphql';
import { defaultUser, UserModel } from '../../models/User';
/*local files imports end*/

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [strongPassword, setStrongPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);

  const history = useHistory();
  const { userId } = useParams<Parameters>();
  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => setShowSuccess(true),
  });

  const genders = ['not specified', 'male', 'female'];
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
    // avatar: '',
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
    // avatar: yup.string(),
  });

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

  const handleSubmit = (userData: UserFrom) => {
    if (editMode === EditMode.new) {
      const aadPassword = generator.generate({
        length: 24,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true,
        strict: true,
      });

      const userWithPassword = { ...userData, aadPassword };

      setStrongPassword(aadPassword);
      createUser({
        variables: {
          user: userWithPassword,
        },
      });
    } else if (editMode === EditMode.edit && currentUser.id) {
      const { email: _email, ...userToUpdate } = userData;

      updateUser({
        variables: {
          userId: Number(currentUser.id),
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
          {({ values, handleChange, handleSubmit, handleBlur, errors, touched }) => {
            const getInputField = (
              title: string,
              fieldName: keyof UserFrom,
              required = false,
              readOnly = false,
              type?: string
            ) => (
              <Form.Group as={Col}>
                <Form.Label>{title}</Form.Label>
                <Form.Control
                  name={fieldName}
                  type={type || 'text'}
                  placeholder={title}
                  value={values[fieldName]}
                  onChange={handleChange}
                  required={required}
                  readOnly={readOnly}
                  isValid={!errors[fieldName] && touched[fieldName]}
                  isInvalid={!!errors[fieldName] && touched[fieldName]}
                  onBlur={handleBlur}
                />
                <Form.Control.Feedback type="invalid">{errors[fieldName]}</Form.Control.Feedback>
              </Form.Group>
            );

            return (
              <Form noValidate>
                <Form.Row>{getInputField('Full Name', 'name', true, editMode === EditMode.readOnly)}</Form.Row>
                <Form.Row>
                  {getInputField('First Name', 'firstName', true, editMode === EditMode.readOnly)}
                  {getInputField('Last name', 'lastName', true, editMode === EditMode.readOnly)}
                </Form.Row>
                <Form.Row>
                  {getInputField(
                    'Email',
                    'email',
                    true,
                    editMode === EditMode.readOnly || editMode === EditMode.edit,
                    'email'
                  )}
                  <Form.Group as={Col}>
                    <Form.Label>Gender</Form.Label>
                    <Form.Control as={'select'} onChange={handleChange} name={'gender'}>
                      {genders.map(el => (
                        <option key={el}>{el}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  {getInputField('City', 'city', false, editMode === EditMode.readOnly)}
                  {getInputField('Country', 'country', false, editMode === EditMode.readOnly)}
                </Form.Row>
                <Form.Row>{getInputField('Phone', 'phone', false, editMode === EditMode.readOnly)}</Form.Row>
                <Form.Row>{getInputField('Avatar', 'avatar', false, editMode === EditMode.readOnly)}</Form.Row>
                <Form.Row>
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
                    </>
                  )}
                  {backButton}
                  {(mutationLoading || updateMutationLoading) && <div>Saving...</div>}
                </Form.Group>
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};
export default UserInput;
