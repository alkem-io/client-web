import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../hooks/generated/graphql';
import { COUNTRIES } from '../../models/constants';
import { TagsetTemplate } from '../../models/graphql-schema';
import { Tagset } from '../../models/Profile';
import { defaultUser, UserFromGenerated, UserModel } from '../../models/User';
import { EditMode } from '../../utils/editMode';
import { FormikInputField } from '../Admin/Common/FormikInputField';
import FormikSelect from '../Admin/Common/FormikSelect';
import ProfileReferenceSegment from '../Admin/Common/ProfileReferenceSegment';
import { referenceSegmentSchema } from '../Admin/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../Admin/Common/TagsetSegment';
import CountrySelect from '../composite/forms/CountrySelect';
import { Loading } from '../core';
import Button from '../core/Button';
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

  const genders = [
    { id: '', label: t('common.genders.notSpecified') },
    { id: 'male', label: t('common.genders.male') },
    { id: 'female', label: t('common.genders.female') },
  ];
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
    country: COUNTRIES.find(x => x.code === country) || null,
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
    const { tagsets, avatar, references, bio, profileId, country, ...otherData } = userData;
    const user: UserModel = {
      ...currentUser,
      ...otherData,
      country: country?.code || '',
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
      {({ values: { references, tagsets, avatar }, handleSubmit, isSubmitting }) => {
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
                    required={true && !isReadOnlyMode}
                    readOnly={isReadOnlyMode || (isEditMode && editMode !== EditMode.new)}
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} sm={6}>
                  <FormikSelect
                    title={'Gender'}
                    name={'gender'}
                    readOnly={isReadOnlyMode}
                    disabled={isReadOnlyMode || isSubmitting}
                    values={genders}
                  />
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col} xs={6}>
                  <CountrySelect readOnly={isReadOnlyMode} disabled={isSubmitting} />
                </Form.Group>
                <Form.Group as={Col}>
                  <FormikInputField
                    name={'city'}
                    title={'City'}
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
                    readOnly={isReadOnlyMode}
                    placeholder={'Bio'}
                    multiline
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
                      text={t('buttons.delete')}
                    />
                  )}
                  {onCancel && (
                    <Button
                      variant={isEditMode ? 'default' : 'primary'}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCancel();
                      }}
                      disabled={isSubmitting}
                      className={'ml-3'}
                      text={t(`buttons.${isEditMode ? 'cancel' : 'back'}`)}
                    />
                  )}
                  <Button
                    variant={'primary'}
                    type="submit"
                    className={'ml-3'}
                    disabled={isSubmitting}
                    text={t('buttons.save')}
                  />
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
