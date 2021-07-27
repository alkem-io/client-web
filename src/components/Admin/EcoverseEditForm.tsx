import { Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset, Visual } from '../../models/graphql-schema';
import Divider from '../core/Divider';
import Typography from '../core/Typography';
import { Required } from '../Required';
import ContextReferenceSegment from './Common/ContextReferenceSegment';
import { contextSegmentSchema, ContextSegment } from './Common/ContextSegment';
import FormikCheckboxField from './Common/FormikCheckboxField';
import { ProfileSegment, profileSegmentSchema } from './Common/ProfileSegment';
import { referenceSegmentSchema } from './Common/ReferenceSegment';
import { tagsetSegmentSchema, TagsetSegment } from './Common/TagsetSegment';
import useProfileStyles from './Common/useProfileStyles';
import { visualSegmentSchema, VisualSegment } from './Common/VisualSegment';

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
    name: profileSegmentSchema.fields?.name || yup.string(),
    nameID: profileSegmentSchema.fields?.nameID || yup.string(),
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

            <ContextReferenceSegment references={references || []} contextId={contextId} />

            {isEdit && (
              <>
                <Form.Row>
                  <Form.Group as={Col} xs={11} className={'d-flex mt-4 align-items-center'}>
                    <Typography variant={'h4'} color={'primary'}>
                      {t('components.editEcoverseForm.read-access-title')}
                    </Typography>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <FormikCheckboxField
                    name="anonymousReadAccess"
                    title={t('components.editEcoverseForm.read-access')}
                  />
                </Form.Row>
              </>
            )}

            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default EcoverseEditForm;
