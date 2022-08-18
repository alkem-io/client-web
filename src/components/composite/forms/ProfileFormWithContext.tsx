import { Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, LifecycleType, Reference, Tagset } from '../../../models/graphql-schema';
import ContextReferenceSegment from '../../Admin/Common/ContextReferenceSegment';
import { ContextSegment, contextSegmentSchema } from '../../Admin/Common/ContextSegment';
import { NameSegment, nameSegmentSchema } from '../../Admin/Common/NameSegment';
import { referenceSegmentSchema } from '../../Admin/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../Admin/Common/TagsetSegment';
import Typography from '../../core/Typography';
import InputField from '../../Admin/Common/InputField';
import { EmptyLocation, Location } from '../../../domain/location/Location';
import { formatLocation } from '../../../domain/location/LocationUtils';
import { LocationSegment } from '../../../domain/location/LocationSegment';
import { LifecycleTemplateSegment } from '../../Admin/Common/LifecycleTemplateSegment';
import { FormikSelectValue } from './FormikSelect';
export interface ProfileFormValuesType {
  name: string;
  nameID: string;
  background: string;
  impact: string;
  tagline: string;
  location: Partial<Location>;
  vision: string;
  who: string;
  references: Reference[];
  // visuals: Visual2[]; todo: enable when it's time
  tagsets: Tagset[];
  innovationFlowTemplateID: string;
}

interface LifecycleTemplateInfo {
  id: string;
  title?: string;
}
interface LifecycleTemplate {
  definition: string;
  id: string;
  type: LifecycleType;
  info: LifecycleTemplateInfo;
}

interface Props {
  context?: Context;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  lifecycleTemplates: LifecycleTemplate[] | undefined;
  onSubmit: (formData: ProfileFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}
// TODO: Should be renamed. Maybe 'ContextForm'
const ProfileFormWithContext: FC<Props> = ({
  context,
  name,
  nameID,
  tagset,
  lifecycleTemplates,
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

  const lifecycleTemplateOptions = useMemo(
    () =>
      Object.values(lifecycleTemplates || []).map<FormikSelectValue>(x => ({
        id: x.id,
        name: x.info.title || '',
      })),
    [lifecycleTemplates]
  );

  const initialValues: ProfileFormValuesType = {
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
    innovationFlowTemplateID: '',
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : nameSegmentSchema.fields?.name || yup.string(),
    nameID: contextOnly ? yup.string() : nameSegmentSchema.fields?.nameID || yup.string(),
    background: contextSegmentSchema.fields?.background || yup.string(),
    impact: contextSegmentSchema.fields?.impact || yup.string(),
    tagline: contextSegmentSchema.fields?.tagline || yup.string(),
    vision: contextSegmentSchema.fields?.vision || yup.string(),
    who: contextSegmentSchema.fields?.who || yup.string(),
    references: referenceSegmentSchema,
    // visual: visualSegmentSchema,
    tagsets: tagsetSegmentSchema,
    innovationFlowTemplateID: yup.string().required(t('forms.validations.required')),
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
      {({ values: { references, innovationFlowTemplateID }, handleSubmit }) => {
        // TODO [ATS]: Research useImperativeHandle and useRef to achieve this.
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        const selectedLifecycleTemplate = lifecycleTemplates?.find(
          template => template.id === innovationFlowTemplateID
        );

        return (
          <>
            {!contextOnly && (
              <>
                <NameSegment disabled={isEdit} required={!isEdit} />
                <InputField name="tagline" label={t('components.contextSegment.tagline')} rows={3} />
              </>
            )}
            <LocationSegment cols={2} cityFieldName="location.city" countryFieldName="location.country" />
            <ContextSegment />

            {!contextOnly && (
              <>
                <Grid item xs={12}>
                  <Typography variant={'h4'} color={'primary'}>
                    {t('components.tagsSegment.title')}
                  </Typography>
                </Grid>
                <TagsetSegment tagsets={tagsets} />
                {!isEdit && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant={'h4'}>Innovation flow template</Typography>
                    </Grid>
                    <LifecycleTemplateSegment
                      lifecycleTemplateOptions={lifecycleTemplateOptions}
                      definition={selectedLifecycleTemplate?.definition || ''}
                      required={true}
                    />
                  </>
                )}
              </>
            )}
            {/*<Grid item xs={12}>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.visualSegment.title')}
              </Typography>
            </Grid>
            <VisualSegment />*/}

            {isEdit && <ContextReferenceSegment references={references || []} contextId={context?.id} />}
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileFormWithContext;
