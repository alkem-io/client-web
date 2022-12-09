import { Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset } from '../../../../core/apollo/generated/graphql-schema';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import ContextReferenceSegment from './Common/ContextReferenceSegment';
import { contextSegmentSchema } from './Common/ContextSegment';
import FormikAutocomplete from '../../../../common/components/composite/forms/FormikAutocomplete';
import { NameSegment, nameSegmentSchema } from './Common/NameSegment';
import { referenceSegmentSchema } from './Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from './Common/TagsetSegment';
import { visualSegmentSchema } from './Common/VisualSegment';
import InputField from './Common/InputField';
import { EmptyLocation, Location } from '../../../common/location/Location';
import { formatLocation } from '../../../common/location/LocationUtils';
import { LocationSegment } from '../../../common/location/LocationSegment';

interface Props {
  context?: Context;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
  onSubmit: (formData: HubEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}

export interface HubEditFormValuesType {
  name: string;
  nameID: string;
  host: string;
  background: string;
  impact: string;
  tagline: string;
  location: Partial<Location>;
  vision: string;
  who: string;
  references: Reference[];
  // todo: https://app.zenhub.com/workspaces/alkemio-5ecb98b262ebd9f4aec4194c/issues/alkem-io/client-web/1628
  // visual: Pick<Visual, 'avatar' | 'background' | 'banner'>;
  tagsets: Tagset[];
}

const HubEditForm: FC<Props> = ({
  context,
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

  const contextId = context?.id;

  const initialValues: HubEditFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    location: formatLocation(context?.location) || EmptyLocation,
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
    tagsets: tagsets,
    host: hostID || '',
    // todo: https://app.zenhub.com/workspaces/alkemio-5ecb98b262ebd9f4aec4194c/issues/alkem-io/client-web/1628
    /*visual: {
      avatar: context?.visual?.avatar || '',
      background: context?.visual?.background || '',
      banner: context?.visual?.banner || '',
    },*/
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    host: yup.string().required(t('forms.validations.required')),
    background: contextSegmentSchema.fields?.background || yup.string(),
    impact: contextSegmentSchema.fields?.impact || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    vision: contextSegmentSchema.fields?.vision || yup.string(),
    who: contextSegmentSchema.fields?.who || yup.string(),
    references: referenceSegmentSchema,
    visual: visualSegmentSchema,
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
            {isEdit && <ContextReferenceSegment references={references || []} contextId={contextId} />}
          </Grid>
        );
      }}
    </Formik>
  );
};

export default HubEditForm;
