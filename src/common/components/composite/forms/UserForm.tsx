import { Box, Button, Grid, IconButton } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { EditMode } from '../../../../core/ui/forms/editMode';
import { SocialNetworkEnum } from '../../../../domain/shared/components/SocialLinks/models/SocialNetworks';
import { Visual } from '../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../../domain/common/profile/Profile';
import { defaultUser, UserFormGenerated, UserModel } from '../../../../domain/community/contributor/user/models/User';
import { logger } from '../../../../services/logging/winston/logger';
import ProfileReferenceSegment from '../../../../domain/platform/admin/components/Common/ProfileReferenceSegment';
import { referenceSegmentValidationObject } from '../../../../domain/platform/admin/components/Common/ReferenceSegment';
import SocialSegment from '../../../../domain/platform/admin/components/Common/SocialSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../../domain/platform/admin/components/Common/TagsetSegment';
import VisualUpload from '../common/VisualUpload/VisualUpload';
import { FormikInputField } from './FormikInputField';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { COUNTRIES } from '../../../../domain/common/location/countries.constants';
import FormRow from '../../../../domain/shared/layout/FormLayout';
import { LocationSegment } from '../../../../domain/common/location/LocationSegment';
import FormikMarkdownField from './FormikMarkdownField';
import { LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';

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
  avatar?: Visual;
  editMode?: EditMode;
  onSave?: (user: UserModel) => Promise<void>;
  onDelete?: (userId: string) => void;
  onVerify?: (type: string) => Promise<void>;
  title?: string;
}

export const UserForm: FC<UserProps> = ({
  user: currentUser = defaultUser,
  avatar,
  editMode = EditMode.readOnly,
  onSave,
  onDelete,
  onVerify,
}) => {
  const { t } = useTranslation();
  const isEditMode = editMode === EditMode.edit || editMode === EditMode.new;
  const isReadOnlyMode = editMode === EditMode.readOnly;

  const {
    firstName,
    lastName,
    email,
    gender,
    phone,
    profile: {
      id: profileId,
      displayName,
      description: bio,
      references,
      location: { city, country },
    },
  } = currentUser;

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
    tagsets: [],
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
    bio: yup.string().max(LONG_TEXT_LENGTH),
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
        city,
        country,
        linkedin,
        twitter,
        github,
        displayName,
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
        profile: {
          id: profileId,
          displayName: displayName,
          description: bio,
          references: finalReferences,
          location: {
            country: country?.code || '',
            city: city ?? '',
          },
          tagsets,
        },
      };
      onSave && (await onSave(user));
    },
    [linkedinRef, twitterRef, githubRef, currentUser, onSave]
  );

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
                      <FormRow cols={2}>
                        <FormikInputField
                          name={'firstName'}
                          title={'First Name'}
                          required={!isReadOnlyMode}
                          readOnly={isReadOnlyMode}
                          placeholder={'First Name'}
                          disabled={isSubmitting}
                        />
                      </FormRow>
                      <FormRow cols={2}>
                        <FormikInputField
                          name={'lastName'}
                          title={'Last name'}
                          required={!isReadOnlyMode}
                          readOnly={isReadOnlyMode}
                          placeholder={'Last name'}
                          disabled={isSubmitting}
                        />
                      </FormRow>
                      <FormRow cols={2}>
                        <FormikInputField
                          name={'displayName'}
                          title={'Full Name'}
                          required={!isReadOnlyMode}
                          readOnly={isReadOnlyMode}
                          placeholder={'Full Name'}
                          disabled={isSubmitting}
                        />
                      </FormRow>

                      <FormRow cols={2}>
                        <FormikInputField
                          name={'phone'}
                          title={'Phone'}
                          readOnly={isReadOnlyMode}
                          placeholder={'Phone'}
                          disabled={isSubmitting}
                        />
                      </FormRow>

                      <LocationSegment readonly={isReadOnlyMode} disabled={isSubmitting} cols={2}>
                        {onVerify && (
                          <>
                            <Box marginLeft={1} />
                            <IconButton sx={{ flexShrink: 0 }} onClick={() => onVerify('ProofOfNameCredential')}>
                              <HealthAndSafetyIcon />
                            </IconButton>
                          </>
                        )}
                      </LocationSegment>
                    </Grid>
                    <Grid container spacing={4} marginTop={2}>
                      <FormRow>
                        <FormikMarkdownField
                          name="bio"
                          title={t('components.profile.fields.bio.title')}
                          readOnly={isReadOnlyMode}
                          placeholder={t('components.profile.fields.bio.title')}
                          multiline
                          rows={5}
                          disabled={isSubmitting}
                          withCounter
                          maxLength={LONG_TEXT_LENGTH}
                        />
                      </FormRow>

                      <TagsetSegment
                        tagsets={tagsets}
                        template={[]}
                        readOnly={isReadOnlyMode}
                        disabled={isSubmitting}
                      />

                      <SocialSegment
                        isNew={editMode === EditMode.new}
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
                </Grid>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
};

export default UserForm;
