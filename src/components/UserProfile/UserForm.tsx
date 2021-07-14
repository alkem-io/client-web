import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../generated/graphql';
import { Tagset } from '../../models/Profile';
import { defaultUser, UserFromGenerated, UserModel } from '../../models/User';
import { TagsetTemplate } from '../../types/graphql-schema';
import countriesList from '../../utils/countriesList.json';
import { EditMode } from '../../utils/editMode';
import { FormikInputField } from '../Admin/Common/FormikInputField';
import ProfileReferenceSegment from '../Admin/Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Admin/Common/ReferenceSegment';
import { tagsetSegmentSchema, TagsetSegment } from '../Admin/Common/TagsetSegment';
import Button from '../core/Button';
import Loading from '../core/Loading';
import SearchDropdown from '../core/SearchDropdown';
import Section, { Header } from '../core/Section';
import EditableAvatar from '../EditableAvatar';

interface UserProps {
  user?: UserModel;
  editMode?: EditMode;
  onSave?: (user: UserModel) => Promise<void>;
  onCancel?: () => void;
  onDelete?: (userId: string) => void;
  title?: string;
}

export const UserForm: FC<UserProps> = ({
  user: currentUser = defaultUser,
  editMode = EditMode.readOnly,
  onSave,
  onCancel,
  onDelete,
  title = 'User',
}) => {
  const { t } = useTranslation();

  const genders = [t('common.genders.notSpecified'), t('common.genders.male'), t('common.genders.female')];
  const { data: config, loading } = useTagsetsTemplateQuery();

  const tagsetsTemplate: TagsetTemplate[] = useMemo(() => {
    if (config) return config.configuration.template.users[0].tagsets || [];
    return [];
  }, [config]);

  const isEditMode = editMode === EditMode.edit || editMode === EditMode.new;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    displayName,
    firstName,
    lastName,
    email,
    city,
    gender,
    phone,
    country,
    profile: { id: profileId, description: bio, references, avatar },
  } = currentUser;

  const tagsets = useMemo(() => {
    let {
      profile: { tagsets },
    } = currentUser;
    return tagsetsTemplate.reduce(
      (acc, cur) => {
        if (acc.every(x => x.name.toLowerCase() !== cur.name.toLowerCase())) {
          acc.push({ name: cur.name, tags: [] });
        }
        return acc;
      },
      [...(tagsets as Tagset[])]
    );
  }, [currentUser, tagsetsTemplate]);

  const initialValues: UserFromGenerated = {
    displayName: displayName || '',
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
    bio: bio || '',
    profileId: profileId || '',
  };

  const validationSchema = yup.object().shape({
    displayName: yup.string().required(t('forms.validations.required')),
    firstName: yup.string().required(t('forms.validations.required')),
    lastName: yup.string().required(t('forms.validations.required')),
    email: yup.string().email('Email is not valid').required(t('forms.validations.required')),
    gender: yup.string(),
    city: yup.string(),
    country: yup.string(),
    phone: yup
      .string()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, 'Phone number not in supported format'),
    avatar: yup.string(),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentSchema,
    bio: yup.string().max(400),
  });

  /**
   * @handleSubmit
   * @param userData instance of UserModel
   * @return void
   * @summary if edits current user data or creates a new one depending on the edit mode
   */
  const handleSubmit = async (userData: UserFromGenerated) => {
    const { tagsets, avatar, references, bio, profileId, ...otherData } = userData;
    const user: UserModel = {
      ...currentUser,
      ...otherData,
      profile: {
        id: profileId,
        description: bio,
        avatar,
        references,
        tagsets,
      },
    };
    onSave && (await onSave(user));
  };

  if (loading) return <Loading text={'Loading'} />;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={isReadOnlyMode ? undefined : validationSchema}
      enableReinitialize
      onSubmit={(values, { setSubmitting }) => handleSubmit(values).finally(() => setSubmitting(false))}
    >
      {({
        values: {
          displayName,
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
          bio,
        },
        setFieldValue,
        handleChange,
        handleSubmit,
        isSubmitting,
      }) => {
        return (
          <Form noValidate onSubmit={handleSubmit}>
            <Section
              avatar={
                <EditableAvatar
                  src={avatar}
                  size={'xl'}
                  className={'mb-2'}
                  name={'Avatar'}
                  profileId={currentUser.profile.id}
                />
              }
            >
              <Header text={title} />
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'displayName'}
                    title={'Full Name'}
                    value={displayName}
                    required={true && !isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'Full Name'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'firstName'}
                    title={'First Name'}
                    value={firstName}
                    required={true && !isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'First Name'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'lastName'}
                    title={'Last name'}
                    value={lastName}
                    required={true && !isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'Last name'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'email'}
                    type={'email'}
                    title={'Email'}
                    value={email}
                    required={true && !isReadOnlyMode}
                    readOnly={isReadOnlyMode || (isEditMode && editMode !== EditMode.new)}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} sm={6}>
                  <Form.Label>Gender</Form.Label>
                  <Form.Control
                    as={'select'}
                    onChange={handleChange}
                    value={gender.toLowerCase()}
                    name={'gender'}
                    readOnly={isReadOnlyMode}
                    disabled={isReadOnlyMode || isSubmitting}
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
                    readOnly={isReadOnlyMode}
                    onSelect={value => setFieldValue('country', value)}
                    disabled={isSubmitting}
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'city'}
                    title={'City'}
                    value={city}
                    readOnly={isReadOnlyMode}
                    placeholder={'City'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'phone'}
                    title={'Phone'}
                    value={phone}
                    readOnly={isReadOnlyMode}
                    placeholder={'Phone'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'bio'}
                    title={'Bio'}
                    value={bio}
                    readOnly={isReadOnlyMode}
                    placeholder={'Bio'}
                    as={'textarea'}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>

              <TagsetSegment
                tagsets={tagsets}
                template={tagsetsTemplate}
                readOnly={isReadOnlyMode}
                disabled={isSubmitting}
              />
              {isEditMode && (
                <ProfileReferenceSegment
                  references={references}
                  readOnly={isReadOnlyMode}
                  disabled={isSubmitting}
                  profileId={profileId}
                />
              )}

              {isEditMode && (
                <div className={'d-flex mt-4'}>
                  <div className={'flex-grow-1'} />
                  {onDelete && (
                    <Button
                      variant={'negative'}
                      onClick={() => onDelete(currentUser.id)}
                      disabled={isSubmitting}
                      className={'ml-3'}
                    >
                      {'Delete'}
                    </Button>
                  )}
                  {onCancel && (
                    <Button
                      variant={isEditMode ? 'default' : 'primary'}
                      onClick={() => onCancel()}
                      disabled={isSubmitting}
                      className={'ml-3'}
                    >
                      {isEditMode ? 'Cancel' : 'Back'}
                    </Button>
                  )}
                  <Button variant={'primary'} type={'submit'} className={'ml-3'} disabled={isSubmitting}>
                    Save
                  </Button>
                </div>
              )}
            </Section>
          </Form>
        );
      }}
    </Formik>
  );
};
export default UserForm;
