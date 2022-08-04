import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import FormikInputField from '../../../../components/composite/forms/FormikInputField';
import { CreateTemplateInfoInput, LifecycleType, Visual } from '../../../../models/graphql-schema';
import FormRows from '../../../shared/components/FormRows';
import TemplateForm from '../TemplateForm';
import Typography from '@mui/material/Typography';
import FormikSelect, {
  FormikSelectValue,
} from '../../../../components/composite/forms/FormikSelect';
import { isValidLifecycleDefinition } from '../../../../components/core/LifecycleVisualizer';
import { SafeLifecycleVisualizer } from './SafeLifecycleVisualizer';

export interface InnovationTemplateFormValues {
  title: string;
  description: string;
  tags: string[];
  type: LifecycleType;
  definition: string;
}

export interface InnovationTemplateFormSubmittedValues {
  definition: string;
  type: LifecycleType;
  info: CreateTemplateInfoInput;
}

interface InnovationTemplateFormProps {
  title: ReactNode;
  initialValues: Partial<InnovationTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<InnovationTemplateFormValues>) => ReactNode);
}

const validator = {
  definition: yup.string()
    .required()
    .test(
      'is-renderable',
      'Invalid definition provided',
        value => isValidLifecycleDefinition(value ?? '')
    ),
  type: yup.string().oneOf(Object.values(LifecycleType))
};

const InnovationTemplateForm = ({ title, initialValues, visual, onSubmit, actions }: InnovationTemplateFormProps) => {
  const { t } = useTranslation();

  const types = useMemo(() => Object.values(LifecycleType).map<FormikSelectValue>(x => ({
    id: x,
    name: x,
  })), [LifecycleType]);

  return (
    <TemplateForm
      title={title}
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {({ values }) => (
        <FormRows>
          <FormikSelect name="type" values={types} title={t('innovation-templates.type.title')} />
          <FormikInputField
            name="definition"
            title={t('innovation-templates.definition.title')}
            placeholder={t('innovation-templates.definition.placeholder')}
            rows={11}
          />
          <Typography>{t('common.preview')}</Typography>
          <SafeLifecycleVisualizer definition={values.definition} />
        </FormRows>
      )}
    </TemplateForm>
  );
};

export default InnovationTemplateForm;