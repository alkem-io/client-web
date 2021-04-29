import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useDeleteReferenceMutation, useTagsetsTemplateQuery } from '../../../generated/graphql';
import { Reference, Tagset } from '../../../models/Profile';
import { defaultUser, UserFromGenerated, UserModel } from '../../../models/User';
import { TagsetTemplate } from '../../../types/graphql-schema';
import countriesList from '../../../utils/countriesList.json';
import { EditMode } from '../../../utils/editMode';
import Loading from '../../core/Loading';
import SearchDropdown from '../../core/SearchDropdown';
import Section, { Header } from '../../core/Section';
import EditableAvatar from '../../EditableAvatar';
import { InputField } from '../Common/InputField';
import { ReferenceSegment } from '../Common/ReferenceSegment';
import TagsetSegment from '../Common/TagsetSegment';
/*local files imports end*/

interface UserProps {
  user?: UserModel;
  editMode?: EditMode;
  onSave?: (user: UserModel) => void;
  onCancel?: () => void;
  title?: string;
}

export const UserForm: FC<UserProps> = ({
  user: currentUser = defaultUser,
  editMode = EditMode.readOnly,
  onSave,
  onCancel,
  title = 'User',
}) => {
  const { t } = useTranslation();
  const [removeRef] = useDeleteReferenceMutation();

  const genders = [t('common.genders.notSpecified'), t('common.genders.male'), t('common.genders.female')];
  const { data: config, loading } = useTagsetsTemplateQuery();

  const tagsetsTemplate: TagsetTemplate[] = useMemo(() => {
    if (config) return config.configuration.template.users[0].tagsets || [];
    return [];
  }, [config]);

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
    bio: bio || '',
    profileId: profileId || '',
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
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
  const handleSubmit = async (userData: UserFromGenerated, initialReferences: Reference[]) => {
    const { tagsets, avatar, references, bio, profileId, ...otherData } = userData;
    const toRemove = initialReferences.filter(x => x.id && !references.some(r => r.id === x.id));

    for (const ref of toRemove) {
      await removeRef({ variables: { input: { ID: Number(ref.id) } } });
    }

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
    onSave && onSave(user);
  };

  if (loading) return <Loading text={'Loading'} />;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={isReadOnlyMode ? undefined : validationSchema}
      enableReinitialize
      onSubmit={values => handleSubmit(values, references)}
    >
      {({
        values: { name, firstName, lastName, email, city, phone, country, references, tagsets, avatar, gender, bio },
        setFieldValue,
        handleChange,
        handleSubmit,
      }) => {
        return (
          <Form noValidate>
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
                <InputField
                  name={'name'}
                  title={'Full Name'}
                  value={name}
                  required={true && !isReadOnlyMode}
                  readOnly={isReadOnlyMode}
                  placeholder={'Full Name'}
                />
              </Form.Row>
              <Form.Row>
                <InputField
                  name={'firstName'}
                  title={'First Name'}
                  value={firstName}
                  required={true && !isReadOnlyMode}
                  readOnly={isReadOnlyMode}
                  placeholder={'First Name'}
                />
                <InputField
                  name={'lastName'}
                  title={'Last name'}
                  value={lastName}
                  required={true && !isReadOnlyMode}
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
                  required={true && !isReadOnlyMode}
                  readOnly={isReadOnlyMode || isEditMode}
                />
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
                    readOnly={isReadOnlyMode}
                    onSelect={value => setFieldValue('country', value)}
                  />
                </Form.Group>
                <InputField name={'city'} title={'City'} value={city} readOnly={isReadOnlyMode} placeholder={'City'} />
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

              <TagsetSegment tagsets={tagsets} template={tagsetsTemplate} readOnly={isReadOnlyMode} />
              <ReferenceSegment references={references} readOnly={isReadOnlyMode} />

              {isEditMode && (
                <div className={'d-flex mt-4'}>
                  <div className={'flex-grow-1'} />
                  {onCancel && (
                    <Button variant={isEditMode ? 'secondary' : 'primary'} onClick={() => onCancel()}>
                      {isEditMode ? 'Cancel' : 'Back'}
                    </Button>
                  )}
                  <Button variant="primary" onClick={() => handleSubmit()} className={'ml-3'}>
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
