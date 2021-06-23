import { Formik } from 'formik';
import React, { FC } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { createStyles } from '../../hooks/useTheme';
import { Context, Reference, Visual } from '../../types/graphql-schema';
import { ReferenceSegment } from '../Admin/Common/ReferenceSegment';
import Divider from '../core/Divider';
import { Required } from '../Required';
import FormikInputField from './Common/FormikInputField';
import FormikTextAreaField from './Common/FormikTextAreaField';
import Typography from '../core/Typography';

interface EcoverseProfile {
  name?: string;
  nameID?: string;
  hostID?: string;
}

interface Props {
  context?: Context;
  profile?: EcoverseProfile;
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
  organizations?: { id: string; name: string }[];
  references: Reference[];
  visual: Pick<Visual, 'avatar' | 'background' | 'banner'>;
}

const useProfileStyles = createStyles(theme => ({
  field: {
    marginBottom: theme.shape.spacing(2),
  },
  row: {
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    '& > div': {
      flexGrow: 1,
    },
  },
}));

const EcoverseEditForm: FC<Props> = ({ context, profile, onSubmit, wireSubmit, isEdit, organizations = [] }) => {
  const { t } = useTranslation();
  const styles = useProfileStyles();

  const initialValues: EcoverseEditFormValuesType = {
    name: profile?.name || '',
    nameID: profile?.nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
    host: profile?.hostID || '',
    visual: {
      avatar: context?.visual?.avatar || '',
      background: context?.visual?.background || '',
      banner: context?.visual?.banner || '',
    },
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required(),
    nameID: yup
      .string()
      .required()
      .min(3, 'NameID should be at least 3 symbols long')
      .max(20, 'Exceeded the limit of 20 characters')
      .matches(/^\S*$/, 'nameID cannot contain spaces'),
    host: yup.string().required(t('forms.validations.required')),
    background: yup.string(), // .required(t('forms.validations.required')),
    impact: yup.string(), // .required(t('forms.validations.required')),
    tagline: yup.string(), // .required(t('forms.validations.required')),
    vision: yup.string(), // .required(t('forms.validations.required')),
    who: yup.string(), // .required(t('forms.validations.required')),

    references: yup.array().of(
      yup.object().shape({
        name: yup.string().required(t('forms.validations.required')),
        uri: yup.string().required(t('forms.validations.required')),
      })
    ),
    visual: yup.object().shape({
      avatar: yup.string(),
      background: yup.string(),
      banner: yup.string(),
    }),
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
        const getInput = ({
          name,
          label,
          placeholder,
          rows,
          disabled = false,
          required,
        }: {
          name: string;
          label: string;
          placeholder?: string;
          rows?: number;
          disabled?: boolean;
          required?: boolean;
        }) => {
          return (
            <Form.Row>
              <Form.Group as={Col} controlId={name}>
                {rows && rows > 1 ? (
                  <FormikTextAreaField
                    name={name}
                    value={values[name] as string}
                    title={label}
                    placeholder={placeholder || label}
                    className={styles.field}
                    disabled={disabled}
                    rows={rows}
                    required={required}
                  />
                ) : (
                  <FormikInputField
                    name={name}
                    title={label}
                    placeholder={placeholder || label}
                    className={styles.field}
                    disabled={disabled}
                    required={required}
                  />
                )}
              </Form.Group>
            </Form.Row>
          );
        };

        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            {getInput({ name: 'name', label: t('components.editEcoverseForm.name'), required: true })}
            {getInput({
              name: 'nameID',
              label: t('components.editEcoverseForm.nameID'),
              placeholder: 'Unique textual identifier, used for URL paths. Note: cannot be modified after creation.',
              disabled: isEdit,
              required: !isEdit,
            })}
            <Form.Group>
              <Form.Label>
                {t('components.editEcoverseForm.host.title')}
                {<Required />}
              </Form.Label>
              <Form.Control
                as={'select'}
                onChange={handleChange}
                value={values.host}
                name={'host'}
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
            {getInput({ name: 'tagline', label: t('components.editEcoverseForm.tagline') })}
            {getInput({ name: 'background', label: t('components.editEcoverseForm.background'), rows: 3 })}
            {getInput({ name: 'impact', label: t('components.editEcoverseForm.impact'), rows: 3 })}
            {getInput({ name: 'vision', label: t('components.editEcoverseForm.vision'), rows: 3 })}
            {getInput({ name: 'who', label: t('components.editEcoverseForm.who'), rows: 3 })}

            <Form.Group>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.editEcoverseForm.visual.title')}
              </Typography>
            </Form.Group>
            {getInput({ name: 'visual.avatar', label: t('components.editEcoverseForm.visual.avatar') })}
            {getInput({ name: 'visual.background', label: t('components.editEcoverseForm.visual.background') })}
            {getInput({ name: 'visual.banner', label: t('components.editEcoverseForm.visual.banner') })}

            <ReferenceSegment references={references || []} />
            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default EcoverseEditForm;
