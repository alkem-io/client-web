import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from '../../../Admin/Common/useInputField';
import * as yup from 'yup';
import { NameSegment, nameSegmentSchema } from '../../../Admin/Common/NameSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../Admin/Common/TagsetSegment';
import { Formik } from 'formik';
import { Box } from '@mui/material';
import { SectionSpacer } from '../../../core/Section/Section';
import { Aspect, Tagset } from '../../../../models/graphql-schema';
import FormikEffectFactory from '../../../../utils/formik/formik-effect/FormikEffect';

type FormValueType = {
  name: string;
  nameID: string;
  description: string;
  tagsets: Tagset[];
};

const FormikEffect = FormikEffectFactory<FormValueType>();

type FormMode = 'new' | 'edit' | 'read';
export type AspectFormOutput = Pick<Aspect, 'displayName' | 'nameID' | 'description' | 'tagset'>;
export type AspectFormInput = AspectFormOutput;
export interface AspectFormProps {
  aspect?: AspectFormInput;
  mode: FormMode;
  onChange: (aspect: AspectFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
}

const AspectForm: FC<AspectFormProps> = ({ aspect, mode, onChange, onStatusChanged }) => {
  const { t } = useTranslation();
  const getInputField = useInputField();

  const initialValues: FormValueType = {
    name: aspect?.displayName ?? '',
    nameID: aspect?.nameID ?? '',
    description: aspect?.description ?? '',
    tagsets: [aspect?.tagset ?? { id: '', name: 'default', tags: [] }],
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    description: yup.string(),
    tagsets: tagsetSegmentSchema,
  });

  const handleChange = (values: FormValueType) => {
    const aspect: AspectFormOutput = {
      displayName: values.name,
      nameID: values.nameID,
      description: values.description,
      tagset: values.tagsets[0],
    };

    onChange(aspect);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {() => (
        <Box>
          <FormikEffect onChange={handleChange} onStatusChange={onStatusChanged} />
          <NameSegment disabled={mode !== 'new'} required={mode === 'new'} />
          <SectionSpacer />
          {getInputField({
            name: 'description',
            label: t('components.aspect-creation.info-step.description'),
            placeholder: t('components.aspect-creation.info-step.description-placeholder'),
            disabled: mode === 'read',
          })}
          <SectionSpacer />
          <TagsetSegment tagsets={initialValues.tagsets} disabled={mode === 'read'} />
        </Box>
      )}
    </Formik>
  );
};
export default AspectForm;
