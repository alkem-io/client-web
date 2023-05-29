import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Profile, Reference, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import ContextReferenceSegment from '../../../../domain/platform/admin/components/Common/ContextReferenceSegment';
import { contextSegmentSchema } from '../../../../domain/platform/admin/components/Common/ContextSegment';
import { NameSegment, nameSegmentSchema } from '../../../../domain/platform/admin/components/Common/NameSegment';
import { referenceSegmentSchema } from '../../../../domain/platform/admin/components/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../../domain/platform/admin/components/Common/TagsetSegment';
import { LocationSegment } from '../../../../domain/common/location/LocationSegment';
import { EmptyLocation, Location } from '../../../../domain/common/location/Location';
import { formatLocation } from '../../../../domain/common/location/LocationUtils';
import { JourneyTypeName } from '../../../../domain/challenge/JourneyTypeName';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';

export interface ProfileFormValues {
  name: string;
  nameID: string;
  tagline: string;
  location: Partial<Location>;
  references: Reference[];
  tagsets: Tagset[];
}

interface ProfileFormProps {
  profile?: Profile;
  journeyType: JourneyTypeName;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  onSubmit: (formData: ProfileFormValues) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}

const ProfileForm: FC<ProfileFormProps> = ({
  profile,
  journeyType,
  name,
  nameID,
  tagset,
  onSubmit,
  wireSubmit,
  isEdit,
  contextOnly = false,
}) => {
  const { t } = useTranslation();
  const tagsets = useMemo(() => {
    if (tagset) return [tagset];
    return [
      {
        id: '',
        name: 'default',
        tags: [],
      },
    ] as Tagset[];
  }, [tagset]);

  const initialValues: ProfileFormValues = {
    name: name || '',
    nameID: nameID || '',
    tagline: profile?.tagline || '',
    location: formatLocation(profile?.location) || EmptyLocation,
    references: profile?.references || [],
    tagsets,
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : nameSegmentSchema.fields?.name || yup.string(),
    nameID: contextOnly ? yup.string() : nameSegmentSchema.fields?.nameID || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    references: referenceSegmentSchema,
    tagsets: tagsetSegmentSchema,
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
          <Gutters>
            <NameSegment disabled={isEdit} required={!isEdit} />
            <LocationSegment
              disabled={!isEdit}
              cols={2}
              cityFieldName="location.city"
              countryFieldName="location.country"
            />
            <FormikInputField
              name={'tagline'}
              title={t(`context.${journeyType}.tagline.title` as const)}
              rows={3}
              maxLength={SMALL_TEXT_LENGTH}
              withCounter
            />
            <BlockSectionTitle color={'primary'}>{t('components.tagsSegment.title')}</BlockSectionTitle>
            <TagsetSegment tagsets={tagsets} />
            <ContextReferenceSegment references={references || []} profileId={profile?.id} />
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
