import { Formik } from 'formik';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SpaceLevel, TagsetReservedName, TagsetType } from '@/core/apollo/generated/graphql-schema';
import ContextReferenceSegment from '@/domain/platform/admin/components/Common/ContextReferenceSegment';
import { spaceAboutSegmentSchema } from '@/domain/space/about/SpaceAboutSegment';
import { nameSegmentSchema } from '@/domain/platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import { LocationSegment } from '../location/LocationSegment';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { EmptyTagset, TagsetModel } from '../tagset/TagsetModel';
import { ReferenceModel } from '../reference/ReferenceModel';
import { ProfileModel } from './ProfileModel';
import { EmptyLocationMapped, LocationModelMapped } from '../location/LocationModelMapped';

export interface ProfileFormValues {
  displayName: string;
  tagline: string;
  location: LocationModelMapped;
  references: ReferenceModel[];
  tagsets: TagsetModel[];
}

type ProfileFormProps = {
  profile: ProfileModel;
  onSubmit: (formData: ProfileFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  spaceLevel?: SpaceLevel;
};

const ProfileForm = ({
  profile,
  onSubmit,
  wireSubmit,
  contextOnly = false,
  spaceLevel = SpaceLevel.L0,
}: ProfileFormProps) => {
  const { t } = useTranslation();

  const initialValues: ProfileFormValues = {
    displayName: profile?.displayName || '',
    tagline: profile?.tagline || '',
    location: profile.location || EmptyLocationMapped,
    references: profile?.references || [],
    tagsets: profile?.tagsets || [EmptyTagset],
  };

  const validationSchema = yup.object().shape({
    displayName: contextOnly ? yup.string() : nameSegmentSchema.fields?.displayName || yup.string(),
    tagline: spaceAboutSegmentSchema.fields?.tagline || yup.string(),
    references: referenceSegmentSchema,
    tagsets: tagsetsSegmentSchema,
  });

  let isSubmitWired = false;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        onSubmit(values);
      }}
    >
      {({ values: { references, tagsets }, handleSubmit }) => {
        // TODO [ATS]: Research useImperativeHandle and useRef to achieve this.
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            <FormikInputField name="name" title={t('components.nameSegment.name')} required />
            <FormikInputField
              name={'tagline'}
              title={t(`context.${spaceLevel}.tagline.title` as const)}
              rows={3}
              maxLength={SMALL_TEXT_LENGTH}
            />
            <LocationSegment cityFieldName="location.city" countryFieldName="location.country" />
            <TagsetSegment title={t('common.tags')} tagsets={tagsets} />
            <ContextReferenceSegment references={references || []} profileId={profile?.id} />
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
