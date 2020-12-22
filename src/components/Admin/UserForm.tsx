import { FieldArray, Formik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { defaultUser, UserFromGenerated, UserModel } from '../../models/User';
import './styles.scss';
import Typography from '../core/Typography';
import { useTagsetsTemplateQuery } from '../../generated/graphql';
import { useRemoveReferenceMutation } from '../../generated/graphql';
/*local files imports end*/

export enum EditMode {
  readOnly,
  edit,
  new,
}
interface UserProps {
  user?: UserModel;
  editMode?: EditMode;
  onSave?: (user: UserModel) => void;
  title?: string;
}

export const UserForm: FC<UserProps> = ({
  user: currentUser = defaultUser,
  editMode = EditMode.readOnly,
  onSave,
  title = 'User',
}) => {
  const [availableTagsets, setAvailableTagsets] = useState<string[]>([]);
  const [isAddingTagset, setIsAddingTagset] = useState<boolean>(false);
  const [selectedTagset, setSelectedTagset] = useState<string>(availableTagsets[0] || '');
  const history = useHistory();
  const [removeRef] = useRemoveReferenceMutation();

  const genders = ['not specified', 'male', 'female'];
  const { data: config } = useTagsetsTemplateQuery({
    onCompleted: data => {
      const { tagsets: templateTagsets } = data.configuration.template.users[0];
      const userTagsets = currentUser?.profile.tagsets.map(t => t.name.toLowerCase());
      const availableTagsetNames = templateTagsets?.filter(tt => !userTagsets.includes(tt.toLowerCase())) || [];
      setAvailableTagsets(availableTagsetNames);
    },
  });

  useEffect(() => {}, [config]);

  let refsToRemove: string[] = [];

  const isEditMode = editMode === EditMode.edit;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    name,
    firstName,
    lastName,
    email,
    city,
    gender,
    phone,
    country,
    accountUpn,
    profile: { description: bio, tagsets, references, avatar },
    memberof: { groups: groupList, challenges: challengeList },
  } = currentUser;

  const groups = groupList.reduce((prev, curr) => {
    if (prev) return prev.concat(', ', curr.name);
    return curr.name;
  }, '');

  const challenges = challengeList.reduce((prev, curr) => {
    if (prev) return prev.concat(', ', curr.name);
    return curr.name;
  }, '');

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
    accountUpn: accountUpn || '',
    bio: bio || '',
    challenges: challenges || '',
    groups: groups || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required('This is the required field'),
    firstName: yup.string().required('This is the required field'),
    lastName: yup.string().required('This is the required field'),
    email: yup.string().email('Email is not valid').required('This is the required field'),
    gender: yup.string(),
    city: yup.string(),
    country: yup.string(),
    phone: yup
      .string()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, 'Phone number not in supported format'),
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
    bio: yup.string().max(400),
  });

  /**
   * @handleSubmit
   * @param userData instance of UserModel
   * @return void
   * @summary if edits current user data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (userData: UserFromGenerated) => {
    if (refsToRemove.length !== 0) {
      for (const ref of refsToRemove) {
        await removeRef({ variables: { ID: Number(ref) } });
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { challenges, groups, tagsets, avatar, references, bio, ...otherData } = userData;
    const user: UserModel = {
      ...currentUser,
      ...otherData,
      profile: {
        description: bio,
        avatar,
        references,
        tagsets,
      },
    };
    onSave && onSave(user);
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
        <Typography variant={'h3'} className={'mt-4 mb-4'}>
          {title}
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={values => handleSubmit(values)}
        >
          {({
            values: {
              name,
              firstName,
              lastName,
              email,
              city,
              phone,
              country,
              references,
              tagsets,
              avatar,
              gender,
              accountUpn,
              bio,
            },
            setFieldValue,
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
              type?: string,
              placeholder?: string,
              as?: React.ElementType
            ) => (
              <Form.Group as={Col}>
                <Form.Label>
                  {title}
                  {required && <span style={{ color: '#d93636' }}>{' *'}</span>}
                </Form.Label>
                <Form.Control
                  name={fieldName}
                  as={as ? as : 'input'}
                  type={type || 'text'}
                  placeholder={placeholder || title}
                  value={value}
                  onChange={handleChange}
                  required={required}
                  readOnly={readOnly}
                  disabled={readOnly}
                  isValid={required ? Boolean(!errors[fieldName]) && Boolean(touched[fieldName]) : undefined}
                  isInvalid={Boolean(!!errors[fieldName]) && Boolean(touched[fieldName])}
                  onBlur={handleBlur}
                />
                <Form.Control.Feedback type="invalid">{errors[fieldName]}</Form.Control.Feedback>
              </Form.Group>
            );

            return (
              <Form noValidate>
                <Form.Row>{getInputField('Full Name', name, 'name', true, isReadOnlyMode)}</Form.Row>
                <Form.Row>
                  {getInputField('First Name', firstName, 'firstName', true, isReadOnlyMode)}
                  {getInputField('Last name', lastName, 'lastName', true, isReadOnlyMode)}
                </Form.Row>
                <Form.Row>
                  {getInputField('Email', email, 'email', true, isReadOnlyMode || isEditMode, 'email')}
                  {getInputField('Azure user name', accountUpn, 'upn', false, true, 'text', ' ')}
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} sm={6}>
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
                <Form.Row>
                  {getInputField('Bio', bio, 'bio', false, isReadOnlyMode, undefined, 'Bio', 'textarea')}
                </Form.Row>
                <Form.Row>{getInputField('Avatar', avatar, 'avatar', false, isReadOnlyMode)}</Form.Row>

                {editMode !== EditMode.new && (
                  <Form.Row>{getInputField('Groups', groups, 'groups', false, true)}</Form.Row>
                )}
                {editMode !== EditMode.new && (
                  <Form.Row>{getInputField('Challenges', challenges, 'challenges', false, true)}</Form.Row>
                )}

                <FieldArray name={'tagsets'}>
                  {({ push, remove }) => (
                    <>
                      <Form.Row>
                        <Form.Group as={Col} xs={2}>
                          <Form.Label>Tagsets</Form.Label>
                          {!isReadOnlyMode && availableTagsets.length > 0 && (
                            <Button
                              className={'ml-3'}
                              onClick={() => {
                                setIsAddingTagset(true);
                                setSelectedTagset(availableTagsets[0]);
                              }}
                              disabled={isAddingTagset}
                            >
                              Add
                            </Button>
                          )}
                        </Form.Group>
                        {isAddingTagset && (
                          <>
                            <Form.Group controlId="tagsetName" as={Col} xs={2}>
                              <Form.Control
                                as="select"
                                custom
                                onChange={e => setSelectedTagset(e.target.value)}
                                defaultValue={selectedTagset}
                              >
                                {availableTagsets?.map((at, index) => (
                                  <option value={at} key={index}>
                                    {at}
                                  </option>
                                ))}
                              </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} xs={1}>
                              <Button
                                className={'ml-3'}
                                variant={'secondary'}
                                onClick={() => {
                                  setSelectedTagset('');
                                  setIsAddingTagset(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </Form.Group>
                            <Form.Group as={Col} xs={1}>
                              {!isReadOnlyMode && (
                                <Button
                                  className={'ml-3'}
                                  onClick={() => {
                                    push({ name: availableTagsets[0], tags: [] });
                                    setSelectedTagset('');
                                    setIsAddingTagset(false);
                                    setAvailableTagsets(availableTagsets.filter(t => t !== selectedTagset));
                                  }}
                                >
                                  Confirm
                                </Button>
                              )}
                            </Form.Group>
                          </>
                        )}
                      </Form.Row>
                      {isReadOnlyMode && tagsets.length === 0 ? (
                        <Form.Control type={'text'} placeholder={'No tagsets yet'} readOnly={true} disabled={true} />
                      ) : (
                        tagsets.map((ts, index) => (
                          <Form.Row key={index} className={'mb-4'}>
                            <Form.Group as={Col}>
                              <Form.Label>Tagset</Form.Label>
                              <Form.Control name={'Tagset'} type={'text'} value={tagsets[index].name} disabled={true} />
                            </Form.Group>
                            <Form.Group as={Col}>
                              <Form.Label>Tags</Form.Label>
                              <Form.Control
                                name={`tagsets.${index}.tags`}
                                type={'text'}
                                placeholder={'innovation, AI, technology, blockchain'}
                                value={tagsets[index].tags?.join(',')}
                                onChange={e => {
                                  const stringValue = e.target.value;
                                  const tagsetArray = stringValue.split(',');
                                  setFieldValue(`tagsets.${index}.tags`, tagsetArray);
                                }}
                                onBlur={() => {
                                  const polishedTagsets = tagsets[index].tags.map(el => el.trim()).filter(el => el);
                                  setFieldValue(`tagsets.${index}.tags`, polishedTagsets);
                                }}
                              />
                            </Form.Group>
                            <Form.Group as={Col} xs={2} className={'form-grp-remove'}>
                              <Button
                                onClick={() => {
                                  remove(index);
                                  setAvailableTagsets([...availableTagsets, tagsets[index].name]);
                                }}
                                variant={'danger'}
                              >
                                Remove
                              </Button>
                            </Form.Group>
                          </Form.Row>
                        ))
                      )}
                    </>
                  )}
                </FieldArray>

                <FieldArray name={'references'}>
                  {({ push, remove }) => (
                    <>
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Form.Label>References</Form.Label>
                          {!isReadOnlyMode && (
                            <Button className={'ml-3'} onClick={() => push({ name: '', uri: '' })}>
                              Add
                            </Button>
                          )}
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
                              <Button
                                onClick={() => {
                                  remove(index);
                                  isEditMode && ref.id && refsToRemove.push(ref.id);
                                }}
                                variant={'danger'}
                              >
                                Remove
                              </Button>
                            </Form.Group>
                          </Form.Row>
                        ))
                      )}
                    </>
                  )}
                </FieldArray>
                {!isReadOnlyMode && (
                  <>
                    <div className={'d-flex mt-4'}>
                      <div className={'flex-grow-1'} />
                      {backButton}
                      <Button variant="primary" onClick={() => handleSubmit()} className={'ml-3'}>
                        Save
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            );
          }}
        </Formik>
      </>
    );
  }
};
export default UserForm;
