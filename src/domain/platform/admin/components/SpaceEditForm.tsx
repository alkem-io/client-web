import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Profile, Reference, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import ContextReferenceSegment from './Common/ContextReferenceSegment';
import { contextSegmentSchema } from './Common/ContextSegment';
import FormikAutocomplete from '../../../../common/components/composite/forms/FormikAutocomplete';
import { NameSegment, nameSegmentSchema } from './Common/NameSegment';
import { referenceSegmentSchema } from './Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from './Common/TagsetSegment';
import { EmptyLocation, Location } from '../../../common/location/Location';
import { formatLocation } from '../../../common/location/LocationUtils';
import { LocationSegment } from '../../../common/location/LocationSegment';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import Gutters from '../../../../core/ui/grid/Gutters';
import { BlockSectionTitle } from '../../../../core/ui/typography';

interface Props {
  context?: Context;
  profile?: Profile;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
  onSubmit: (formData: SpaceEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
}

export interface SpaceEditFormValuesType {
  name: string;
  nameID: string;
  host: string;
  tagline: string;
  location: Partial<Location>;
  references: Reference[];
  tagsets: Tagset[];
}

const SpaceEditForm: FC<Props> = ({
  profile,
  name,
  nameID,
  hostID,
  tagset,
  onSubmit,
  wireSubmit,
  isEdit,
  organizations = [],
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

  const profileId = profile?.id;

  const initialValues: SpaceEditFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    tagline: profile?.tagline || '',
    location: formatLocation(profile?.location) || EmptyLocation,
    references: profile?.references || [],
    tagsets: tagsets,
    host: hostID || '',
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    host: yup.string().required(t('forms.validations.required')),
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
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <Gutters>
            <NameSegment disabled={isEdit} required={!isEdit} />
            <FormikAutocomplete
              title={t('components.editSpaceForm.host.title')}
              name="host"
              values={organizations}
              required
              placeholder={t('components.editSpaceForm.host.title')}
            />
            <FormikInputField
              name={'tagline'}
              title={t('context.space.tagline.title')}
              rows={3}
              maxLength={SMALL_TEXT_LENGTH}
              withCounter
            />
            <LocationSegment cols={2} cityFieldName="location.city" countryFieldName="location.country" />
            <BlockSectionTitle color={'primary'}>{t('components.tagsSegment.title')}</BlockSectionTitle>
            <TagsetSegment tagsets={tagsets} />
            {isEdit && <ContextReferenceSegment references={references || []} profileId={profileId} />}
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default SpaceEditForm;
