import { FieldArray, Formik } from 'formik';
import generator from 'generate-password';
import gql from 'graphql-tag';
import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, Col, Form, FormControl } from 'react-bootstrap';
import { Prompt, useHistory } from 'react-router-dom';
import * as yup from 'yup';
/*components imports end*/
import { useCreateUserMutation, useUpdateUserMutation } from '../../generated/graphql';
import { USER_DETAILS_FRAGMENT } from '../../graphql/admin';
import { defaultUser, UserFromGenerated, UserModel } from '../../models/User';
/*lib imports end*/
import InputWithCopy from './InputWithCopy';
import './styles.scss';
/*local files imports end*/

export enum EditMode {
  readOnly,
  edit,
  new,
}
interface UserProps {
  user: UserModel;
  editMode?: EditMode;
  onSave?: (user: UserModel) => void;
  title?: string;
}

export const UserForm: FC<UserProps> = ({
  user: currentUser = defaultUser,
  editMode = EditMode.readOnly,
  onSave: _onSave,
  title,
}) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [strongPassword, setStrongPassword] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const history = useHistory();
  const [updateUser, { loading: updateMutationLoading }] = useUpdateUserMutation({
    onError: error => console.log(error),
    onCompleted: () => setShowSuccess(true),
  });

  const genders = ['not specified', 'male', 'female'];

  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  /**
   * @name skills AkA tags
   * @return string
   * @summary goes through the tagsets and if they exist returns a joined string of tags from tagsets;
   */
  const skills = // AKA tags
    currentUser.profile.tagsets.length > 0
      ? currentUser.profile.tagsets
          .reduce((acc, curr) => [...acc, ...curr.tags], [''])
          .filter(t => t)
          .join(', ')
      : '';
  const [userSkills, setUserSkills] = useState<string>(skills);
  useEffect(() => setUserSkills(skills), [skills]);

  const {
    name,
    firstName,
    lastName,
    email,
    city,
    gender,
    phone,
    country,
    profile: { tagsets, references, avatar },
  } = currentUser;

  const initialValues = {
    name: name || '',
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    gender: gender || '',
    city: city || '',
    country: country || '',
    phone: phone || '',
    avatar: avatar || '',
    tagsets: tagsets,
    references: references || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required('This is the required field'),
    firstName: yup.string().required('This is the required field'),
    lastName: yup.string().required('This is the required field'),
    email: yup.string().email('Email is not valid').required('This is the required field'),
    gender: yup.string(),
    city: yup.string(),
    country: yup.string(),
    phone: yup.string(),
    avatar: yup.string(),
    tagsets: yup.array().of(
      yup.object().shape({
        name: yup.string(),
        tags: yup.array().of(yup.string()),
      })
    ),
    references: yup.array().of(
      yup.object().shape({
        name: yup.string(),
        uri: yup.string(),
      })
    ),
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
                  ${USER_DETAILS_FRAGMENT}
                `,
              });
              return [...existingTodos, newUserRef];
            },
          },
        });
      }
    },
  });

  /**
   * @handleSubmit
   * @param userData instance of UserModel
   * @return void
   * @summary if edits current user data or creates a new one depending on the edit mode
   */
  const handleSubmit = (userData: UserFromGenerated): void => {
    const { tagsets, avatar, references, ...otherData } = userData;
    const tags = userSkills.split(',').map(t => t && t.trim());
    const user = {
      ...otherData,
      profileData: {
        description: 'some description',
        avatar,
        tagsetsData: [
          {
            name: 'Science',
            tags,
          },
        ],
        referencesData: references,
      },
    };

    if (editMode === EditMode.new) {
      const aadPassword = generator.generate({
        length: 24,
        numbers: true,
        symbols: true,
        excludeSimilarCharacters: true,
        exclude: '"', // avoid causing invalid Json
        strict: true,
      });

      const userWithPassword = { ...user, aadPassword };

      setStrongPassword(aadPassword);
      createUser({
        variables: {
          user: userWithPassword,
        },
      });
    } else if (isEditMode && currentUser.id) {
      const { email, ...userToUpdate } = user;

      updateUser({
        variables: {
          userId: Number(currentUser.id),
          user: userToUpdate,
        },
      });
    }
  };

  const handleBack = () => history.goBack();

  const backButton = (
    <Button variant={editMode ? 'secondary' : 'primary'} onClick={handleBack}>
      {editMode ? 'Cancel' : 'Back'}
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
          message={
            'Make sure you copied the Generated Password! Once you close this form the password will be lost forever!'
          }
        />
        <Alert show={showError} variant="danger" onClose={() => setShowError(false)} dismissible>
          Error saving user.
        </Alert>
        <Alert show={showSuccess} variant="success" onClose={() => setShowSuccess(false)} dismissible>
          Saved successfully.
        </Alert>
        <h2 className={'mt-4 mb-4'}>{title || 'User'}</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => handleSubmit(values)}
        >
          {({
            values: { name, firstName, lastName, email, city, phone, country, references, avatar, gender },
            handleChange,
            handleSubmit,
            handleBlur,
            errors,
            touched,
          }) => {
            const getInputField = (
              title: string,
              value: string,
              fieldName: string,
              required = false,
              readOnly = false,
              type?: string
            ) => (
              <Form.Group as={Col}>
                <Form.Label>
                  {title}
                  {required && <span style={{ color: '#d93636' }}>{' *'}</span>}
                </Form.Label>
                <Form.Control
                  name={fieldName}
                  type={type || 'text'}
                  placeholder={title}
                  value={value}
                  onChange={fieldName === 'tagsets' ? handleTagSet : handleChange}
                  required={required}
                  readOnly={readOnly}
                  disabled={readOnly}
                  isValid={required ? Boolean(!errors[fieldName]) && Boolean(touched[fieldName]) : undefined}
                  isInvalid={required ? Boolean(!!errors[fieldName]) && Boolean(touched[fieldName]) : undefined}
                  onBlur={handleBlur}
                />
                <Form.Control.Feedback type="invalid">{errors[fieldName]}</Form.Control.Feedback>
              </Form.Group>
            );

            const handleTagSet = ({ target: { value } }) => {
              setUserSkills(value);
            };

            return (
              <Form noValidate>
                <Form.Row>{getInputField('Full Name', name, 'name', true, isReadOnlyMode)}</Form.Row>
                <Form.Row>
                  {getInputField('First Name', firstName, 'firstName', true, isReadOnlyMode)}
                  {getInputField('Last name', lastName, 'lastName', true, isReadOnlyMode)}
                </Form.Row>
                <Form.Row>
                  {getInputField('Email', email, 'email', true, isReadOnlyMode || isEditMode, 'email')}
                  <Form.Group as={Col}>
                    <Form.Label>Gender</Form.Label>
                    <Form.Control
                      as={'select'}
                      onChange={handleChange}
                      value={gender}
                      name={'gender'}
                      readOnly={isReadOnlyMode}
                      disabled={isReadOnlyMode}
                    >
                      {genders.map(el => (
                        <option key={el}>{el}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  {getInputField('City', city, 'city', false, isReadOnlyMode)}
                  {getInputField('Country', country, 'country', false, isReadOnlyMode)}
                </Form.Row>
                <Form.Row>{getInputField('Phone', phone, 'phone', false, isReadOnlyMode)}</Form.Row>
                <Form.Row>{getInputField('Avatar', avatar, 'avatar', false, isReadOnlyMode)}</Form.Row>
                <Form.Row>{getInputField('Skills', userSkills, 'tagsets', false, isReadOnlyMode)}</Form.Row>

                <FieldArray name={'references'}>
                  {({ push, remove }) => (
                    <>
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Form.Label>References</Form.Label>{' '}
                          {!isReadOnlyMode && <Button onClick={() => push({ name: '', uri: '' })}>Add</Button>}
                        </Form.Group>
                      </Form.Row>
                      {isReadOnlyMode && references.length === 0 ? (
                        <Form.Control type={'text'} placeholder={'No references yet'} readOnly={true} disabled={true} />
                      ) : (
                        references.map((ref, index) => (
                          <Form.Row key={index}>
                            {getInputField(
                              'Name',
                              references[index].name,
                              `references.${index}.name`,
                              false,
                              isReadOnlyMode
                            )}
                            {getInputField(
                              'URI',
                              references[index].uri,
                              `references.${index}.uri`,
                              false,
                              isReadOnlyMode
                            )}
                            <Form.Group as={Col} xs={2} className={'form-grp-remove'}>
                              <Form.Label>{'123'}</Form.Label>
                              <Button onClick={() => remove(index)} variant={'danger'}>
                                Remove
                              </Button>
                            </Form.Group>
                          </Form.Row>
                        ))
                      )}
                    </>
                  )}
                </FieldArray>
                <Form.Row>
                  <Form.Group as={Col}>
                    {isBlocked && <InputWithCopy label="Generated Password" text={strongPassword} />}
                    <FormControl.Feedback type="invalid">Test</FormControl.Feedback>
                  </Form.Group>
                </Form.Row>
                <Alert show={isBlocked} variant="warning">
                  Please copy the "Generated password". Once form is closed it will be lost forever.
                </Alert>
                {!isReadOnlyMode && (
                  <>
                    <Form.Group>
                      <Button variant="primary" onClick={() => handleSubmit()}>
                        Save
                      </Button>{' '}
                      {backButton}
                    </Form.Group>
                  </>
                )}
                {(mutationLoading || updateMutationLoading) && <div>Saving...</div>}
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};
export default UserForm;
