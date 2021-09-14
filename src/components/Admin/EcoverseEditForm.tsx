import { Grid } from '@material-ui/core';
import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset, Visual } from '../../models/graphql-schema';
import Divider from '../core/Divider';
import Typography from '../core/Typography';
import ContextReferenceSegment from './Common/ContextReferenceSegment';
import { ContextSegment, contextSegmentSchema } from './Common/ContextSegment';
import FormikCheckboxField from './Common/FormikCheckboxField';
import FormikSelect from './Common/FormikSelect';
import { NameSegment, nameSegmentSchema } from './Common/NameSegment';
import { referenceSegmentSchema } from './Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from './Common/TagsetSegment';
import { VisualSegment, visualSegmentSchema } from './Common/VisualSegment';

interface Props {
  context?: Context;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
  anonymousReadAccess?: boolean;
  onSubmit: (formData: EcoverseEditFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}

export interface EcoverseEditFormValuesType {
  name: string;
  nameID: string;
  host: string;
  background: string;
  impact: string;
  tagline: string;
  vision: string;
  who: string;
  references: Reference[];
  visual: Pick<Visual, 'avatar' | 'background' | 'banner'>;
  anonymousReadAccess: boolean;
  tagsets: Tagset[];
}

const EcoverseEditForm: FC<Props> = ({
  context,
  name,
  nameID,
  hostID,
  tagset,
  onSubmit,
  wireSubmit,
  isEdit,
  anonymousReadAccess,
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

  const initialValues: EcoverseEditFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
    tagsets: tagsets,
    host: hostID || '',
    visual: {
      avatar: context?.visual?.avatar || '',
      background: context?.visual?.background || '',
      banner: context?.visual?.banner || '',
    },
    anonymousReadAccess: anonymousReadAccess != null ? anonymousReadAccess : true,
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
    anonymousReadAccess: yup.boolean(),
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
              <FormikSelect
                title={t('components.editEcoverseForm.host.title')}
                name={'host'}
                values={organizations}
                required={true}
                placeholder={t('components.editEcoverseForm.host.title')}
              />
            </Grid>
            <ContextSegment />
            <Grid item xs={12}>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.tagsSegment.title')}
              </Typography>
            </Grid>
            <TagsetSegment tagsets={tagsets} />
            <Grid item xs={12}>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.visualSegment.title')}
              </Typography>
            </Grid>
            <VisualSegment />
            {isEdit && <ContextReferenceSegment references={references || []} contextId={contextId} />}
            <Grid item xs={12}>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.editEcoverseForm.read-access-title')}
              </Typography>

              <FormikCheckboxField name="anonymousReadAccess" title={t('components.editEcoverseForm.read-access')} />
            </Grid>

            <Divider />
          </Grid>
        );
      }}
    </Formik>
  );
};

export default EcoverseEditForm;
