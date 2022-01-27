import { Box, Button, Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useTagsetsTemplateQuery } from '../../../hooks/generated/graphql';
import { COUNTRIES } from '../../../models/constants';
import { EditMode } from '../../../models/editMode';
import { SocialNetworkEnum } from '../../../models/enums/SocialNetworks';
import { TagsetTemplate, Visual2 } from '../../../models/graphql-schema';
import { Reference, Tagset } from '../../../models/Profile';
import { defaultUser, UserFormGenerated, UserModel } from '../../../models/User';
import { logger } from '../../../services/logging/winston/logger';
import ProfileReferenceSegment from '../../Admin/Common/ProfileReferenceSegment';
import { referenceSegmentValidationObject } from '../../Admin/Common/ReferenceSegment';
import SocialSegment from '../../Admin/Common/SocialSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../Admin/Common/TagsetSegment';
import { Loading } from '../../core';
import VisualUpload from '../common/VisualUpload/VisualUpload';
import CountrySelect from './CountrySelect';
import { FormikInputField } from './FormikInputField';

const socialNames = [
  SocialNetworkEnum.github.toString(),
  SocialNetworkEnum.linkedin.toString(),
  SocialNetworkEnum.twitter.toString(),
];

const referenceSegmentWithSocialSchema = yup.array().of(
  referenceSegmentValidationObject.shape({
    name: yup
      .string()
      .test('includesSocial', 'Use the social section', value => !value || !socialNames.includes(value.toLowerCase())),
  })
);

interface UserProps {
  user?: UserModel;
  avatar?: Visual2;
  editMode?: EditMode;
  onSave?: (user: UserModel) => Promise<void>;
  onDelete?: (userId: string) => void;
  title?: string;
}

export const UserForm: FC<UserProps> = ({
  user: currentUser = defaultUser,
  avatar,
  editMode = EditMode.readOnly,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();

  // const genders = [
  //   { id: '', name: t('common.genders.notSpecified') },
  //   { id: 'male', name: t('common.genders.male') },
  //   { id: 'female', name: t('common.genders.female') },
  // ];

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
    profile: { id: profileId, description: bio, references },
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

  const twitterRef = useMemo(
    () => references.find(x => x.name.toLowerCase() === SocialNetworkEnum.twitter),
    [references]
  );
  const githubRef = useMemo(
    () => references.find(x => x.name.toLowerCase() === SocialNetworkEnum.github),
    [references]
  );
  const linkedinRef = useMemo(
    () => references.find(x => x.name.toLowerCase() === SocialNetworkEnum.linkedin),
    [references]
  );

  const initialValues: UserFormGenerated = {
    displayName: displayName || '',
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    linkedin: linkedinRef?.uri || '',
    twitter: twitterRef?.uri || '',
    github: githubRef?.uri || '',
    gender: gender || '',
    city: city || '',
    country: COUNTRIES.find(x => x.code === country) || null,
    phone: phone || '',
    tagsets: tagsets,
    references: references.filter(x => !socialNames.includes(x.name.toLowerCase())) || [],
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
    phone: yup
      .string()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, 'Phone number not in supported format'),
    avatar: yup.string(),
    linkedin: yup.string().url('Linkedin url must be a valid URL'),
    twitter: yup.string().url('Twitter url must be a valid URL'),
    github: yup.string().url('Github url must be a valid URL'),
    tagsets: tagsetSegmentSchema,
    references: referenceSegmentWithSocialSchema,
    bio: yup.string().max(400),
  });

  /**
   * @handleSubmit
   * @param userData instance of UserModel
   * @return void
   * @summary if edits current user data or creates a new one depending on the edit mode
   */
  const handleSubmit = useCallback(
    async (userData: UserFormGenerated) => {
      const {
        tagsets,
        references: newReferences,
        bio,
        profileId,
        country,
        linkedin,
        twitter,
        github,
        ...otherData
      } = userData;
      const finalReferences = [
        ...newReferences,
        { ...linkedinRef, uri: linkedin } as Reference,
        { ...twitterRef, uri: twitter } as Reference,
        { ...githubRef, uri: github } as Reference,
      ];
      const user: UserModel = {
        ...currentUser,
        ...otherData,
        country: country?.code || '',
        profile: {
          id: profileId,
          description: bio,
          references: finalReferences,
          tagsets,
        },
      };
      onSave && (await onSave(user));
    },
    [linkedinRef, twitterRef, githubRef]
  );

  if (loading) return <Loading text={'Loading'} />;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={isReadOnlyMode ? undefined : validationSchema}
      enableReinitialize
      onSubmit={(values, { setSubmitting }) => {
        handleSubmit(values).finally(() => setSubmitting(false));
      }}
    >
      {({ values: { references, tagsets }, handleSubmit, isSubmitting, errors }) => {
        logger.info(errors);
        return (
          <form noValidate onSubmit={handleSubmit}>
            <Box marginTop={4} />
            <Grid container rowSpacing={4} direction="column">
              <Grid item xs={12}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md="auto">
                    <Grid item container justifyContent="center">
                      <VisualUpload visual={avatar} />
                    </Grid>
                  </Grid>
                  <Grid item xs>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <FormikInputField
                          name={'firstName'}
                          title={'First Name'}
                          required={true && !isReadOnlyMode}
                          readOnly={isReadOnlyMode}
                          placeholder={'First Name'}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormikInputField
                          name={'lastName'}
                          title={'Last name'}
                          required={true && !isReadOnlyMode}
                          readOnly={isReadOnlyMode}
                          placeholder={'Last name'}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormikInputField
                          name={'displayName'}
                          title={'Full Name'}
                          required={true && !isReadOnlyMode}
                          readOnly={isReadOnlyMode}
                          placeholder={'Full Name'}
                          disabled={isSubmitting}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormikInputField
                          name={'phone'}
                          title={'Phone'}
                          readOnly={isReadOnlyMode}
                          placeholder={'Phone'}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <CountrySelect readOnly={isReadOnlyMode} disabled={isSubmitting} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormikInputField
                          name={'city'}
                          title={'City'}
                          readOnly={isReadOnlyMode}
                          placeholder={'City'}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container item spacing={4}>
                <Grid item xs={12}>
                  <FormikInputField
                    name={'bio'}
                    title={'Bio'}
                    readOnly={isReadOnlyMode}
                    placeholder={'Bio'}
                    multiline
                    rows={5}
                    disabled={isSubmitting}
                  />
                </Grid>
                <TagsetSegment
                  tagsets={tagsets}
                  template={tagsetsTemplate}
                  readOnly={isReadOnlyMode}
                  disabled={isSubmitting}
                />
                <SocialSegment isNew={editMode === EditMode.new} readOnly={isReadOnlyMode} disabled={isSubmitting} />
                {isEditMode && (
                  <ProfileReferenceSegment
                    references={references}
                    readOnly={isReadOnlyMode}
                    disabled={isSubmitting}
                    profileId={profileId}
                  />
                )}

                {isEditMode && (
                  <Grid container item justifyContent={'flex-end'} spacing={2}>
                    {onDelete && (
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => onDelete(currentUser.id)}
                          disabled={isSubmitting}
                        >
                          {t('buttons.delete')}
                        </Button>
                      </Grid>
                    )}
                    <Grid item>
                      <Button variant="contained" type="submit" disabled={isSubmitting}>
                        {t('buttons.save')}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};
export default UserForm;
