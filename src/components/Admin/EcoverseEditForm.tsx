import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Visual, Tagset } from '../../types/graphql-schema';
import Divider from '../core/Divider';
import { Required } from '../Required';
import Typography from '../core/Typography';
import { ReferenceSegment, referenceSegmentSchema } from './Common/ReferenceSegment';
import { contextFragmentSchema, ContextSegment } from './Common/ContextSegment';
import { VisualSegment, visualFragmentSchema } from './Common/VisualSegment';
import { TagsetSegment, tagsetFragmentSchema } from './Common/TagsetSegment';
import useProfileStyles from './Common/useProfileStyles';
import { ProfileSegment, profileSegmentSchema } from './Common/ProfileSegment';

interface Props {
  context?: Context;
  name?: string;
  nameID?: string;
  hostID?: string;
  tagset?: Tagset;
  organizations?: { id: string; name: string }[];
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
  organizations = [],
}) => {
  const { t } = useTranslation();
  const styles = useProfileStyles();

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
  };

  const validationSchema = yup.object().shape({
    name: profileSegmentSchema.fields?.name || yup.string(),
    nameID: profileSegmentSchema.fields?.nameID || yup.string(),
    host: yup.string().required(t('forms.validations.required')),
    background: contextFragmentSchema.fields?.background || yup.string(),
    impact: contextFragmentSchema.fields?.impact || yup.string(),
    tagline: contextFragmentSchema.fields?.tagline || yup.string(),
    vision: contextFragmentSchema.fields?.vision || yup.string(),
    who: contextFragmentSchema.fields?.who || yup.string(),
    references: referenceSegmentSchema,
    visual: visualFragmentSchema,
    tagsets: tagsetFragmentSchema,
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
      {({ values: { references }, values, handleSubmit, handleChange, handleBlur, errors }) => {
        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            <ProfileSegment disabled={isEdit} required={!isEdit} />
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>
                  {t('components.editEcoverseForm.host.title')}
                  {<Required />}
                </Form.Label>
                <Form.Control
                  as={'select'}
                  onChange={handleChange}
                  value={values.host}
                  name={'host'}
                  className={styles.field}
                  onBlur={handleBlur}
                  isInvalid={!!errors['host']}
                >
                  <option key={'not-value-key'} value={''}>
                    {t('components.editEcoverseForm.host.select')}
                  </option>
                  {organizations.map((e, i) => (
                    <option key={`select-id-${i}`} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">{errors['host']}</Form.Control.Feedback>
              </Form.Group>
            </Form.Row>
            <ContextSegment />

            <Form.Group>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.tagsSegment.title')}
              </Typography>
            </Form.Group>
            <TagsetSegment tagsets={tagsets} />

            <Form.Group>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.visualSegment.title')}
              </Typography>
            </Form.Group>
            <VisualSegment />

            <ReferenceSegment references={references || []} />
            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default EcoverseEditForm;
