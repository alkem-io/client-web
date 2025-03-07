import { Box, Button, IconButton, Theme, useMediaQuery } from '@mui/material';
import { Formik } from 'formik';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { EditMode } from '@/core/ui/forms/editMode';
import { SocialNetworkEnum } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import { Visual } from '@/core/apollo/generated/graphql-schema';
import { Reference } from '@/domain/common/profile/Profile';
import { defaultUser, UserFormGenerated, UserModel } from '../models/User';
import ProfileReferenceSegment from '@/domain/platform/admin/components/Common/ProfileReferenceSegment';
import { referenceSegmentValidationObject } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import SocialSegment from '@/domain/platform/admin/components/Common/SocialSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { FormikInputField } from '@/core/ui/forms/FormikInputField/FormikInputField';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { LocationSegment } from '@/domain/common/location/LocationSegment';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { ALT_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import Gutters from '@/core/ui/grid/Gutters';
import GridItem from '@/core/ui/grid/GridItem';
import { LoadingButton } from '@mui/lab';
import GridProvider from '@/core/ui/grid/GridProvider';
import GridContainer from '@/core/ui/grid/GridContainer';

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

type UserProps = {
  user?: UserModel;
  avatar?: Visual;
  editMode?: EditMode;
  onSave?: (user: UserModel) => Promise<void>;
  onDelete?: (userId: string) => void;
  onVerify?: (type: string) => Promise<void>;
};

export const UserForm = ({
  user: currentUser = defaultUser,
  avatar,
  editMode = EditMode.readOnly,
  onSave,
  onDelete,
  onVerify,
}: UserProps) => {
  const { t } = useTranslation();
  const isEditMode = editMode === EditMode.edit || editMode === EditMode.new;
  const isReadOnlyMode = editMode === EditMode.readOnly;
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const {
    firstName,
    lastName,
    email,
    phone,
    profile: {
      id: profileId,
      displayName,
      description: bio,
      tagline,
      references,
      location: { city, country } = {},
      tagsets,
    },
  } = currentUser;

  const twitterRef = useMemo(
    () => references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.twitter),
    [references]
  );
  const githubRef = useMemo(
    () => references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.github),
    [references]
  );
  const linkedinRef = useMemo(
    () => references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.linkedin),
    [references]
  );

  const initialValues: UserFormGenerated = {
    displayName: displayName || '',
    tagline: tagline || '',
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    linkedin: linkedinRef?.uri || '',
    twitter: twitterRef?.uri || '',
    github: githubRef?.uri || '',
    city: city || '',
    country: COUNTRIES.find(x => x.code === country) || null,
    phone: phone || '',
    tagsets: tagsets ?? [],
    references: references?.filter(x => !socialNames.includes(x.name.toLowerCase())) ?? [],
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
    github: yup.string().url('github url must be a valid URL'),
    tagsets: tagsetsSegmentSchema,
    references: referenceSegmentWithSocialSchema,
    bio: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    tagline: yup.string().max(ALT_TEXT_LENGTH),
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
        tagline,
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
          displayName,
          tagline,
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
      {({ values: { references, tagsets }, handleSubmit, isSubmitting }) => {
        return (
          <GridContainer>
            <GridProvider columns={12}>
              <GridItem columns={isMobile ? 6 : 2}>
                <Box display="flex" justifyContent="center">
                  <VisualUpload
                    visual={avatar}
                    altText={t('visuals-alt-text.avatar.contributor.text', {
                      displayName,
                      altText: avatar?.alternativeText,
                    })}
                  />
                </Box>
              </GridItem>

              <GridItem columns={isMobile ? 6 : 8}>
                <Gutters>
                  <FormikInputField
                    name={'firstName'}
                    title={'First Name'}
                    required={!isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'First Name'}
                    disabled={isSubmitting}
                  />
                  <FormikInputField
                    name={'lastName'}
                    title={'Last name'}
                    required={!isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'Last name'}
                    disabled={isSubmitting}
                  />
                  <FormikInputField
                    name={'displayName'}
                    title={'Full Name'}
                    required={!isReadOnlyMode}
                    readOnly={isReadOnlyMode}
                    placeholder={'Full Name'}
                    disabled={isSubmitting}
                  />

                  <FormikInputField
                    name={'phone'}
                    title={'Phone'}
                    readOnly={isReadOnlyMode}
                    placeholder={'Phone'}
                    disabled={isSubmitting}
                  />

                  <LocationSegment readonly={isReadOnlyMode} disabled={isSubmitting} cols={2}>
                    {onVerify && (
                      <>
                        <Box marginLeft={1} />
                        <IconButton
                          sx={{ flexShrink: 0 }}
                          onClick={() => onVerify('ProofOfNameCredential')}
                          aria-label={t('common.verified-status.verified')}
                        >
                          <HealthAndSafetyIcon />
                        </IconButton>
                      </>
                    )}
                  </LocationSegment>
                  <FormikInputField
                    name={'tagline'}
                    title={t('components.profile.fields.tagline.title')}
                    readOnly={isReadOnlyMode}
                    placeholder={t('components.profile.fields.tagline.title')}
                    disabled={isSubmitting}
                    maxLength={ALT_TEXT_LENGTH}
                  />
                  <FormikMarkdownField
                    name="bio"
                    title={t('components.profile.fields.bio.title')}
                    readOnly={isReadOnlyMode}
                    placeholder={t('components.profile.fields.bio.title')}
                    multiline
                    rows={5}
                    disabled={isSubmitting}
                    maxLength={MARKDOWN_TEXT_LENGTH}
                  />
                  <TagsetSegment tagsets={tagsets} readOnly={isReadOnlyMode} disabled={isSubmitting} />

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
                    <>
                      {onDelete && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => onDelete(currentUser.id)}
                          disabled={isSubmitting}
                        >
                          {t('buttons.delete')}
                        </Button>
                      )}
                      <LoadingButton variant="contained" onClick={() => handleSubmit()} loading={isSubmitting}>
                        {t('buttons.save')}
                      </LoadingButton>
                    </>
                  )}
                </Gutters>
              </GridItem>
            </GridProvider>
          </GridContainer>
        );
      }}
    </Formik>
  );
};

export default UserForm;
