import { Formik } from 'formik';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import ContextReferenceSegment from '@/domain/platformAdmin/components/Common/ContextReferenceSegment';
import { spaceAboutSegmentSchema } from '@/domain/space/about/SpaceAboutSegment';
import { nameSegmentSchema } from '@/domain/platformAdmin/components/Common/NameSegment';
import { referenceSegmentSchema } from '@/domain/platformAdmin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platformAdmin/components/Common/TagsetSegment';
import { LocationSegment } from '../location/LocationSegment';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { EmptyTagset, TagsetModel } from '../tagset/TagsetModel';
import { ReferenceModel } from '../reference/ReferenceModel';
import { ProfileModel } from './ProfileModel';
import { EmptyLocationMapped, LocationModelMapped } from '../location/LocationModelMapped';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

export interface ProfileFormValues {
  displayName: string;
  tagline: string;
  location: LocationModelMapped;
  references: ReferenceModel[];
  tagsets: TagsetModel[];
}

export interface ProfileFormHandle {
  submit: () => void;
}

type ProfileFormProps = {
  profile: ProfileModel;
  onSubmit: (formData: ProfileFormValues) => void;
  spaceLevel?: SpaceLevel;
};

const ProfileForm = forwardRef<ProfileFormHandle, ProfileFormProps>(
  ({ profile, onSubmit, spaceLevel = SpaceLevel.L0 }, ref) => {
    const { t } = useTranslation();

    const initialValues: ProfileFormValues = {
      displayName: profile?.displayName ?? '',
      tagline: profile?.tagline ?? '',
      location: profile.location ?? EmptyLocationMapped,
      references: profile?.references ?? [],
      tagsets: profile?.tagsets ? profile.tagsets : profile?.tagset ? [profile.tagset] : [EmptyTagset],
    };

    const validationSchema = yup.object().shape({
      displayName: nameSegmentSchema.fields.displayName,
      tagline: spaceAboutSegmentSchema.fields?.tagline || textLengthValidator(),
      location: yup.object().shape({
        city: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),
      }),
      references: referenceSegmentSchema,
      tagsets: tagsetsSegmentSchema,
    });

    const submitRef = useRef<(() => void) | null>(null);

    // Expose submit method to parent component
    useImperativeHandle(ref, () => ({
      submit: () => {
        submitRef.current?.();
      },
    }));

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async values => {
          onSubmit(values);
        }}
      >
        {({ values: { references }, handleSubmit }) => {
          // Store handleSubmit in ref
          submitRef.current = handleSubmit;

          return (
            <>
              <FormikInputField name="displayName" title={t('components.nameSegment.name')} required />
              <FormikInputField
                name={'tagline'}
                title={t(`context.${spaceLevel}.tagline.title` as const)}
                rows={3}
                maxLength={SMALL_TEXT_LENGTH}
              />
              <LocationSegment cityFieldName="location.city" countryFieldName="location.country" />
              <TagsetSegment title={t('common.tags')} />
              <ContextReferenceSegment references={references || []} profileId={profile?.id} />
            </>
          );
        }}
      </Formik>
    );
  }
);

ProfileForm.displayName = 'ProfileForm';

export default ProfileForm;
