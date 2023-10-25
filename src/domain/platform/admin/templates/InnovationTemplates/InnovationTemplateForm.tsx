import React, { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { CreateProfileInput, InnovationFlowType, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import FormRows from '../../../../shared/components/FormRows';
import TemplateForm from '../TemplateForm';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import FormikSelect, { FormikSelectValue } from '../../../../../core/ui/forms/FormikSelect';
import { SafeInnovationFlowVisualizer } from './SafeInnovationFlowVisualizer';
import { LifecycleDataProvider } from '@alkemio/visualization';

export interface InnovationTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  type: InnovationFlowType;
  definition: string;
}

export interface InnovationTemplateFormSubmittedValues {
  definition: string;
  type: InnovationFlowType;
  profile: CreateProfileInput;
}

interface InnovationTemplateFormProps {
  initialValues: Partial<InnovationTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<InnovationTemplateFormValues>) => ReactNode);
  editMode?: boolean;
}

const validator = {
  definition: yup
    .string()
    .required()
    .test('is-renderable', 'Invalid definition provided', value =>
      value ? LifecycleDataProvider.validateLifecycleDefinition(value) : false
    ),
  type: yup.string().oneOf(Object.values(InnovationFlowType)),
};

const InnovationTemplateForm = ({
  initialValues,
  visual,
  onSubmit,
  actions,
  editMode = false,
}: InnovationTemplateFormProps) => {
  const { t } = useTranslation();

  const types = useMemo(
    () =>
      Object.values(InnovationFlowType).map<FormikSelectValue>(x => ({
        id: x,
        name: x,
      })),
    []
  );

  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {({ values }) => (
        <FormRows>
          <FormikSelect
            name="type"
            values={types}
            title={t('templateLibrary.innovationFlowTemplates.type')}
            disabled={editMode}
          />
          <FormikInputField
            name="definition"
            title={t('innovation-templates.definition.title')}
            placeholder={t('innovation-templates.definition.placeholder')}
            rows={11}
          />
          <Typography>{t('common.preview')}</Typography>
          <Box sx={{ maxWidth: theme => theme.spacing(64) }}>
            <SafeInnovationFlowVisualizer definition={values.definition} />
          </Box>
        </FormRows>
      )}
    </TemplateForm>
  );
};

export default InnovationTemplateForm;
