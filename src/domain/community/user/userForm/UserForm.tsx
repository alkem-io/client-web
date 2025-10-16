import { Box, Button } from '@mui/material';
import { Formik } from 'formik';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { EditMode } from '@/core/ui/forms/editMode';
import { socialNames, SocialNetworkEnum } from '@/domain/shared/components/SocialLinks/models/SocialNetworks';
import { VisualModelFull } from '@/domain/common/visual/model/VisualModel';
import { defaultUser, UserFormGenerated, UserModel } from '../models/UserModel';
import ProfileReferenceSegment from '@/domain/platformAdmin/components/Common/ProfileReferenceSegment';
import { referenceSegmentValidationObject } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import SocialSegment from '@/domain/platformAdmin/components/Common/SocialSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { FormikInputField } from '@/core/ui/forms/FormikInputField/FormikInputField';
import { COUNTRIES } from '@/domain/common/location/countries.constants';
import { LocationSegment } from '@/domain/common/location/LocationSegment';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { ALT_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import Gutters from '@/core/ui/grid/Gutters';
import GridItem from '@/core/ui/grid/GridItem';
import GridProvider from '@/core/ui/grid/GridProvider';
import GridContainer from '@/core/ui/grid/GridContainer';
import { useScreenSize } from '@/core/ui/grid/constants';
import { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import { nameValidator } from '@/core/ui/forms/validator/nameValidator';
import { emailValidator } from '@/core/ui/forms/validator/emailValidator';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

const referenceSegmentWithSocialSchema = yup.array().of(
  referenceSegmentValidationObject.shape({
    name: yup
      .string()
      .test('includesSocial', 'Use the social section', value => !value || !socialNames.includes(value.toLowerCase())),
  })
);

type UserProps = {
  user?: UserModel;
  avatar?: VisualModelFull;
  editMode?: EditMode;
  onSave?: (user: UserModel) => Promise<void>;
  onDelete?: (userId: string) => void;
};

export const UserForm = ({
  user: currentUser = defaultUser,
  avatar,
  editMode = EditMode.readOnly,
  onSave,
  onDelete,
}: UserProps) => {
  const { t } = useTranslation();
  const isEditMode = editMode === EditMode.edit || editMode === EditMode.new;
  const isReadOnlyMode = editMode === EditMode.readOnly;
  const { isSmallScreen } = useScreenSize();

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

  const { blueSkyRef, githubRef, linkedinRef } = useMemo(
    () => ({
      blueSkyRef: references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.bsky),
      githubRef: references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.github),
      linkedinRef: references?.find(x => x.name.toLowerCase() === SocialNetworkEnum.linkedin),
    }),
    [references]
  );

  const initialValues: UserFormGenerated = {
    displayName: displayName || '',
    tagline: tagline || '',
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    linkedin: linkedinRef?.uri || '',
    bsky: blueSkyRef?.uri || '',
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
    displayName: displayNameValidator({ required: true }),
    firstName: nameValidator.required(t('forms.validations.requiredField')),
    lastName: nameValidator.required(t('forms.validations.requiredField')),
    email: emailValidator({ required: true }),
    gender: textLengthValidator(),
    city: textLengthValidator(),
    phone: yup
      .string()
      .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im, 'Phone number not in supported format'),
    linkedin: yup
      .string()
      .url(t('forms.validations.elementMustBeValidUrl', { name: t('components.profileSegment.socialLinks.linkedin') })),
    bsky: yup
      .string()
      .url(t('forms.validations.elementMustBeValidUrl', { name: t('components.profileSegment.socialLinks.bsky') })),
    github: yup
      .string()
      .url(t('forms.validations.elementMustBeValidUrl', { name: t('components.profileSegment.socialLinks.github') })),
    tagsets: tagsetsSegmentSchema,
    references: referenceSegmentWithSocialSchema,
    bio: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    tagline: textLengthValidator({ maxLength: ALT_TEXT_LENGTH }),
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
        bsky,
        github,
        displayName,
        tagline,
        ...otherData
      } = userData;

      const finalReferences = [
        ...newReferences,
        { ...linkedinRef, uri: linkedin } as ReferenceModel,
        { ...blueSkyRef, uri: bsky } as ReferenceModel,
        { ...githubRef, uri: github } as ReferenceModel,
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
            id: '',
            country: country?.code || '',
            city: city ?? '',
          },
          tagsets,
        },
      };
      onSave && (await onSave(user));
    },
    [linkedinRef, blueSkyRef, githubRef, currentUser, onSave]
  );

  return (
    <Formik
      key={currentUser.id ?? 'new'}
      initialValues={initialValues}
      validationSchema={isReadOnlyMode ? undefined : validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        handleSubmit(values).finally(() => setSubmitting(false));
      }}
    >
      {({ values: { references }, handleSubmit, isSubmitting }) => {
        return (
          <GridContainer>
            <GridProvider columns={12}>
              <GridItem columns={isSmallScreen ? 6 : 2}>
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

              <GridItem columns={isSmallScreen ? 6 : 8}>
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

                  <LocationSegment readonly={isReadOnlyMode} disabled={isSubmitting} />
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
                  <TagsetSegment readOnly={isReadOnlyMode} disabled={isSubmitting} />

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
                      <Button variant="contained" onClick={() => handleSubmit()} loading={isSubmitting}>
                        {t('buttons.save')}
                      </Button>
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
