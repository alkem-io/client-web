import { Grid } from '@mui/material';
import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset } from '../../../models/graphql-schema';
import ContextReferenceSegment from '../../Admin/Common/ContextReferenceSegment';
import { ContextSegment, contextSegmentSchema } from '../../Admin/Common/ContextSegment';
import { NameSegment, nameSegmentSchema } from '../../Admin/Common/NameSegment';
import { referenceSegmentSchema } from '../../Admin/Common/ReferenceSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../Admin/Common/TagsetSegment';
import Typography from '../../core/Typography';

export interface ProfileFormValuesType {
  name: string;
  nameID: string;
  background: string;
  impact: string;
  tagline: string;
  vision: string;
  who: string;
  references: Reference[];
  // visuals: Visual2[]; todo: enable when it's time
  tagsets: Tagset[];
}

interface Props {
  context?: Context;
  name?: string;
  nameID?: string;
  tagset?: Tagset;
  onSubmit: (formData: ProfileFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}
// TODO: Should be renamed. Maybe 'ContextForm'
const ProfileForm: FC<Props> = ({
  context,
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

  const initialValues: ProfileFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
    tagsets: tagsets,
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
            {!contextOnly && <NameSegment disabled={isEdit} required={!isEdit} />}
            <ContextSegment />

            {!contextOnly && (
              <>
                <Grid item xs={12}>
                  <Typography variant={'h4'} color={'primary'}>
                    {t('components.tagsSegment.title')}
                  </Typography>
                </Grid>
                <TagsetSegment tagsets={tagsets} />
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

export default ProfileForm;
