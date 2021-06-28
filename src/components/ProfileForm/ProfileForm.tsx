import { Field, Formik } from 'formik';
import React, { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Context, Reference, Tagset, Visual } from '../../types/graphql-schema';
import ContextReferenceSegment from '../Admin/Common/ContextReferenceSegment';
import { contextFragmentSchema } from '../Admin/Common/ContextSegment';
import { profileSegmentSchema } from '../Admin/Common/ProfileSegment';
import { referenceSegmentSchema } from '../Admin/Common/ReferenceSegment';
import { tagsetFragmentSchema, TagsetSegment } from '../Admin/Common/TagsetSegment';
import useProfileStyles from '../Admin/Common/useProfileStyles';
import { visualFragmentSchema } from '../Admin/Common/VisualSegment';
import Divider from '../core/Divider';
import { TextArea } from '../core/TextInput';
import Typography from '../core/Typography';

export interface ProfileFormValuesType {
  name: string;
  nameID: string;
  background: string;
  impact: string;
  tagline: string;
  vision: string;
  who: string;
  references: Reference[];
  visual: Pick<Visual, 'avatar' | 'background' | 'banner'>;
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

  const initialValues: ProfileFormValuesType = {
    name: name || '',
    nameID: nameID || '',
    background: context?.background || '',
    impact: context?.impact || '',
    tagline: context?.tagline || '',
    vision: context?.vision || '',
    who: context?.who || '',
    references: context?.references || [],
    visual: {
      avatar: context?.visual?.avatar || '',
      background: context?.visual?.background || '',
      banner: context?.visual?.banner || '',
    },
    tagsets: tagsets,
  };

  const validationSchema = yup.object().shape({
    name: contextOnly ? yup.string() : profileSegmentSchema.fields?.name || yup.string(),
    nameID: contextOnly ? yup.string() : profileSegmentSchema.fields?.nameID || yup.string(),
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
      {({ values: { references }, handleChange, handleBlur, handleSubmit }) => {
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
          return (
            <Form.Group controlId={name}>
              {!contextOnly && <Form.Label>{label}</Form.Label>}
              <Field name={name}>
                {({ field, form: { touched }, meta }) => {
                  const fieldProps = {
                    ...(contextOnly ? { error: !!meta.error && touched } : { isInvalid: !!meta.error && touched }),
                  };
                  return (
                    <>
                      <ConditionalTextArea
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name={name}
                        value={field.value}
                        label={label}
                        className={styles.field}
                        placeholder={placeholder || label}
                        rows={rows || contextOnly ? 2 : 3}
                        as={'textarea'}
                        disabled={disabled}
                        {...fieldProps}
                      />
                      <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>
                    </>
                  );
                }}
              </Field>
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
                {getTextArea({ name: 'name', label: t('components.profileSegment.name') })}
                {getTextArea({
                  name: 'nameID',
                  label: t('components.profileSegment.nameID.title'),
                  placeholder: t('components.profileSegment.nameID.placeholder'),
                  disabled: isEdit,
                  rows: 1,
                })}
              </>
            )}
            {getTextArea({ name: 'tagline', label: t('components.contextSegment.tagline') })}
            {getTextArea({ name: 'background', label: t('components.contextSegment.background') })}
            {getTextArea({ name: 'impact', label: t('components.contextSegment.impact') })}
            {getTextArea({ name: 'vision', label: t('components.contextSegment.vision') })}
            {getTextArea({ name: 'who', label: t('components.contextSegment.who') })}

            {!contextOnly && (
              <>
                <Form.Group>
                  <Typography variant={'h4'} color={'primary'}>
                    {t('components.tagsSegment.title')}
                  </Typography>
                </Form.Group>
                <TagsetSegment tagsets={tagsets} />
              </>
            )}

            <Form.Group>
              <Typography variant={'h4'} color={'primary'}>
                {t('components.visualSegment.title')}
              </Typography>
            </Form.Group>
            {getTextArea({ name: 'visual.avatar', label: t('components.visualSegment.avatar') })}
            {getTextArea({ name: 'visual.background', label: t('components.visualSegment.background') })}
            {getTextArea({ name: 'visual.banner', label: t('components.visualSegment.banner') })}

            <ContextReferenceSegment references={references || []} contextId={context?.id} />
            <Divider />
          </>
        );
      }}
    </Formik>
  );
};

export default ProfileForm;
