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
import { formatLocation } from '../location/LocationUtils';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { TagsetModel } from '../tagset/TagsetModel';
import { ReferenceModel } from '../reference/ReferenceModel';
import { ProfileModel } from './ProfileModel';
import { EmptyLocationMapped, LocationModelMapped } from '../location/LocationModelMapped';

export interface ProfileFormValues {
  name: string;
  tagline: string;
  location: Partial<LocationModelMapped>;
  references: ReferenceModel[];
  tagsets: TagsetModel[];
}

type ProfileFormProps = {
  profile?: ProfileModel;
  name?: string;
  tagset?: TagsetModel;
  onSubmit: (formData: ProfileFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  spaceLevel?: SpaceLevel;
};

const ProfileForm = ({
  profile,
  name,
  tagset,
  onSubmit,
  wireSubmit,
  contextOnly = false,
  spaceLevel = SpaceLevel.L0,
}: ProfileFormProps) => {
  const { t } = useTranslation();
  const tagsets = useMemo(() => {
    if (tagset) return [tagset];
    return [
      {
        id: '',
        name: TagsetReservedName.Default,
        tags: [],
        allowedValues: [],
        type: TagsetType.Freeform,
      },
    ] as TagsetModel[];
  }, [tagset]);


  const initialValues: ProfileFormValues = {
    name: name || '',
    tagline: profile?.tagline || '',
    location: formatLocation(profile?.location) || EmptyLocationMapped,
    references: profile?.references || [],
    tagsets,
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : nameSegmentSchema.fields?.name || yup.string(),
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
      {({ values: { references }, handleSubmit }) => {
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
