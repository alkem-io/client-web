import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useInputField } from '../../../Admin/Common/useInputField';
import * as yup from 'yup';
import { NameSegment, nameSegmentSchema } from '../../../Admin/Common/NameSegment';
import { TagsetSegment, tagsetSegmentSchema } from '../../../Admin/Common/TagsetSegment';
import { Formik } from 'formik';
import { Box } from '@mui/material';
import { SectionSpacer } from '../../../core/Section/Section';
import FormikEffectFactory from '../../../../utils/formik/formik-effect/FormikEffect';
import { AspectCreationType } from '../AspectCreationDialog/AspectCreationDialog';
import { Tagset } from '../../../../models/graphql-schema';

type FormValueType = {
  name: string;
  nameID: string;
  description: string;
  tagsets: Tagset[];
  type: string;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

export type AspectFormOutput = {
  displayName: string;
  nameID: string;
  description: string;
  tags: string[];
  type: string;
};
export type AspectFormInput = AspectCreationType;
export interface AspectFormProps {
  aspect?: AspectFormInput;
  edit?: boolean;
  loading?: boolean;
  onChange?: (aspect: AspectFormOutput) => void;
  onStatusChanged?: (isValid: boolean) => void;
}

const AspectForm: FC<AspectFormProps> = ({ aspect, edit = false, loading, onChange, onStatusChanged }) => {
  const { t } = useTranslation();
  const getInputField = useInputField();

  const tagsets: Tagset[] = [
    {
      id: '-1',
      name: 'default',
      tags: aspect?.tags ?? [],
    },
  ];

  const initialValues: FormValueType = {
    name: aspect?.displayName ?? '',
    nameID: aspect?.nameID ?? '',
    description: aspect?.description ?? '',
    tagsets,
    type: aspect?.type ?? '',
  };

  const validationSchema = yup.object().shape({
    name: nameSegmentSchema.fields?.name || yup.string(),
    nameID: nameSegmentSchema.fields?.nameID || yup.string(),
    description: yup.string().required(),
    tagsets: tagsetSegmentSchema,
  });

  const handleChange = (values: FormValueType) => {
    const aspect: AspectFormOutput = {
      displayName: values.name,
      nameID: values.nameID,
      description: values.description,
      tags: values.tagsets[0].tags,
      type: values.type,
    };

    onChange && onChange(aspect);
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
          <NameSegment
            disabled={edit}
            required={!edit}
            nameHelpText={t('components.aspect-creation.info-step.name-help-text')}
            nameIDHelpText={t('components.aspect-creation.info-step.name-id-help-text')}
          />
          {getInputField({
            name: 'type',
            label: t('components.aspect-creation.type-step.label'),
            helpText: t('components.aspect-creation.type-step.type-help-text'),
            required: true,
            disabled: true,
          })}
          <SectionSpacer />
          {getInputField({
            name: 'description',
            label: t('components.aspect-creation.info-step.description'),
            placeholder: t('components.aspect-creation.info-step.description-placeholder'),
            helpText: t('components.aspect-creation.info-step.description-help-text'),
            required: true,
          })}
          <SectionSpacer />
          <TagsetSegment
            tagsets={tagsets}
            title={t('common.tags')}
            helpText={t('components.aspect-creation.info-step.tags-help-text')}
            loading={loading}
          />
        </Box>
      )}
    </Formik>
  );
};
export default AspectForm;
