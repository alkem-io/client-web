import { Formik } from 'formik';
import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import * as yup from 'yup';
import { createStyles } from '../../hooks/useTheme';
import { Context, Reference } from '../../types/graphql-schema';
import { ReferenceSegment } from '../Admin/Common/ReferenceSegment';
import Divider from '../core/Divider';
import { TextArea } from '../core/TextInput';

interface Profile {
  name?: string;
  nameID?: string;
}

interface Props {
  context?: Context;
  profile?: Profile;
  onSubmit: (formData: ProfileFormValuesType) => void;
  wireSubmit: (setter: () => void) => void;
  contextOnly?: boolean;
  isEdit: boolean;
}

export interface ProfileFormValuesType {
  name: string;
  nameID: string;
  background: string;
  impact: string;
  tagline: string;
  vision: string;
  who: string;
  references: Reference[];
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

const ProfileForm: FC<Props> = ({ context, profile, onSubmit, wireSubmit, isEdit, contextOnly = false }) => {
  const styles = useProfileStyles();

  const initialValues: ProfileFormValuesType = {
    name: profile?.name || '',
    nameID: profile?.nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : yup.string().required(),
    nameID: contextOnly
      ? yup.string()
      : yup
          .string()
          .required()
          .min(3, 'nameID should be at least 3 symbols long')
          .max(20, 'Exceeded the limit of 20 characters')
          .matches(/^\S*$/, 'nameID cannot contain spaces'),
    // state: contextOnly ? yup.string() : yup.string().required(),
    background: yup.string().required(),
    impact: yup.string().required(),
    tagline: yup.string().required(),
    vision: yup.string().required(),
    who: yup.string().required(),
    references: yup.array().of(
      yup.object().shape({
        name: yup.string().required(),
        uri: yup.string().required(),
      })
    ),
  });

  let isSubmitWired = false;
  const ConditionalTextArea = contextOnly ? TextArea : Form.Control;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async values => {
        onSubmit(values);
      }}
    >
      {({ values: { references }, values, handleChange, handleBlur, errors, touched, handleSubmit }) => {
        const getTextArea = ({
          name,
          label,
          placeholder,
          rows,
          disabled = false,
        }: {
          name: string;
          label: string;
          placeholder?: string;
          rows?: number;
          disabled?: boolean;
        }) => {
          const fieldProps = {
            ...(contextOnly
              ? { error: !!errors[name] && touched[name] }
              : { isInvalid: !!errors[name] && touched[name] }),
          };
          return (
            <Form.Group controlId={name}>
              {!contextOnly && <Form.Label>{label}</Form.Label>}
              <ConditionalTextArea
                onChange={handleChange}
                onBlur={handleBlur}
                name={name}
                value={values[name] as string}
                label={label}
                className={styles.field}
                placeholder={placeholder || label}
                rows={rows || contextOnly ? 2 : 3}
                as={'textarea'}
                disabled={disabled}
                {...fieldProps}
              />
              {errors[name] && <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>}
            </Form.Group>
          );
        };

        if (!isSubmitWired) {
          wireSubmit(handleSubmit);
          isSubmitWired = true;
        }

        return (
          <>
            {!contextOnly && (
              <>
                {getTextArea({ name: 'name', label: 'Name' })}
                {getTextArea({
                  name: 'nameID',
                  label: 'Text ID',
                  rows: 1,
                  placeholder:
                    'Unique textual identifier, used for URL paths. Note: cannot be modified after creation.',
                  disabled: isEdit,
                })}
              </>
            )}
            {getTextArea({ name: 'tagline', label: 'Tagline' })}
            {getTextArea({ name: 'background', label: 'Background' })}
            {getTextArea({ name: 'impact', label: 'Impact' })}
            {getTextArea({ name: 'vision', label: 'Vision' })}
            {getTextArea({ name: 'who', label: 'Who' })}

            <ReferenceSegment references={references || []} />
            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
