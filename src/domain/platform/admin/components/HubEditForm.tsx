import { Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Profile, Reference, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import ContextReferenceSegment from './Common/ContextReferenceSegment';
import { contextSegmentSchema } from './Common/ContextSegment';
import FormikAutocomplete from '../../../../common/components/composite/forms/FormikAutocomplete';
import { NameSegment, nameSegmentSchema } from './Common/NameSegment';
import { referenceSegmentSchema } from './Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from './Common/TagsetSegment';
import InputField from './Common/InputField';
import { EmptyLocation, Location } from '../../../common/location/Location';
import { formatLocation } from '../../../common/location/LocationUtils';
import { LocationSegment } from '../../../common/location/LocationSegment';

interface Props {
  context?: Context;
  profile?: Profile;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
  onSubmit: (formData: HubEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  isEdit: boolean;
}

export interface HubEditFormValuesType {
  name: string;
  nameID: string;
  host: string;
  tagline: string;
  location: Partial<Location>;
  references: Reference[];
  tagsets: Tagset[];
}

const HubEditForm: FC<Props> = ({
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

  const initialValues: HubEditFormValuesType = {
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
          <Grid container spacing={2}>
            <NameSegment disabled={isEdit} required={!isEdit} />
            <Grid item xs={12}>
              <FormikAutocomplete
                title={t('components.editHubForm.host.title')}
                name="host"
                values={organizations}
                required
                placeholder={t('components.editHubForm.host.title')}
              />
            </Grid>
            <InputField name="tagline" label={t('context.hub.tagline.title')} rows={3} />
            <LocationSegment cols={2} cityFieldName="location.city" countryFieldName="location.country" />
            <Grid item xs={12}>
              <WrapperTypography variant={'h4'} color={'primary'}>
                {t('components.tagsSegment.title')}
              </WrapperTypography>
            </Grid>
            <TagsetSegment tagsets={tagsets} />
            {/* <Grid item xs={12}>
              <WrapperTypography variant={'h4'} color={'primary'}>
                {t('components.visualSegment.title')}
              </WrapperTypography>
            </Grid>
            <VisualSegment />*/}
            {isEdit && <ContextReferenceSegment references={references || []} profileId={profileId} />}
          </Grid>
        );
      }}
    </Formik>
  );
};

export default HubEditForm;
