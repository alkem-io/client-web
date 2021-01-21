import { FieldArray, Formik } from 'formik';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { defaultUser, Tagset, UserFromGenerated, UserModel } from '../../../models/User';
import Typography from '../../core/Typography';
import { useTagsetsTemplateQuery } from '../../../generated/graphql';
import { useRemoveReferenceMutation } from '../../../generated/graphql';
import countriesList from '../../../utils/countriesList.json';
import SearchDropdown from '../../core/SearchDropdown';
import { EditMode } from '../../../utils/editMode';
import TagsetSegment from '../Common/TagsetSegment';
import { InputField } from '../Common/InputField';
/*local files imports end*/

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
    profile: { description: bio, references, avatar },
    memberof: { groups: groupList, challenges: challengeList },
  } = currentUser;

  const tagsets = useMemo(() => {
    let {
      profile: { tagsets },
    } = currentUser;
    return availableTagsets.reduce(
      (acc, cur) => {
        if (acc.every(x => x.name.toLowerCase() !== cur.toLowerCase())) {
          acc.push({ name: cur, tags: [] });
        }
        return acc;
      },
      [...(tagsets as Tagset[])]
    );
  }, [currentUser, availableTagsets]);

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
          }) => {
            return (
              <Form noValidate>
                <Form.Row>
                  <InputField
                    name={'name'}
                    title={'Full Name'}
                    value={name}
                    required={true}
                    readOnly={isReadOnlyMode}
                    placeholder={'Full Name'}
                  />
                </Form.Row>
                <Form.Row>
                  <InputField
                    name={'firstName'}
                    title={'First Name'}
                    value={firstName}
                    required={true}
                    readOnly={isReadOnlyMode}
                    placeholder={'First Name'}
                  />
                  <InputField
                    name={'lastName'}
                    title={'Last name'}
                    value={lastName}
                    required={true}
                    readOnly={isReadOnlyMode}
                    placeholder={'Last name'}
                  />
                </Form.Row>
                <Form.Row>
                  <InputField
                    name={'email'}
                    type={'email'}
                    title={'Email'}
                    value={email}
                    required={true}
                    readOnly={isReadOnlyMode || isEditMode}
                  />
                  <InputField
                    name={'upn'}
                    title={'Azure user name'}
                    value={accountUpn}
                    readOnly={true}
                    placeholder={'Azure user name'}
                  />
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
                  <Form.Group as={Col} xs={6}>
                    <Form.Label>Country</Form.Label>
                    <SearchDropdown
                      value={country}
                      data={countriesList.map(el => el.name)}
                      onSelect={value => setFieldValue('country', value)}
                    />
                  </Form.Group>
                  <InputField
                    name={'city'}
                    title={'City'}
                    value={city}
                    readOnly={isReadOnlyMode}
                    placeholder={'City'}
                  />
                </Form.Row>
                <Form.Row>
                  <InputField
                    name={'phone'}
                    title={'Phone'}
                    value={phone}
                    readOnly={isReadOnlyMode}
                    placeholder={'Phone'}
                  />
                </Form.Row>
                <Form.Row>
                  <InputField
                    name={'bio'}
                    title={'Bio'}
                    value={bio}
                    readOnly={isReadOnlyMode}
                    placeholder={'Bio'}
                    as={'textarea'}
                  />
                </Form.Row>
                <Form.Row>
                  <InputField
                    name={'avatar'}
                    title={'Avatar'}
                    value={avatar}
                    readOnly={isReadOnlyMode}
                    placeholder={'Avatar'}
                  />
                </Form.Row>

                {editMode !== EditMode.new && (
                  <Form.Row>
                    <InputField
                      name={'groups'}
                      title={'Groups'}
                      value={groups}
                      readOnly={true}
                      placeholder={'Groups'}
                    />
                  </Form.Row>
                )}
                {editMode !== EditMode.new && (
                  <Form.Row>
                    <InputField
                      name={'challenges'}
                      title={'Challenges'}
                      value={challenges}
                      readOnly={true}
                      placeholder={'Challenges'}
                    />
                  </Form.Row>
                )}

                <TagsetSegment tagsets={tagsets} readOnly={isReadOnlyMode} />
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
                            <InputField
                              name={`references.${index}.name`}
                              title={'Name'}
                              value={references[index].name}
                              readOnly={isReadOnlyMode}
                            />
                            <InputField
                              name={`references.${index}.uri`}
                              title={'URI'}
                              value={references[index].uri}
                              readOnly={isReadOnlyMode}
                            />
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
