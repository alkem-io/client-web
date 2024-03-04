import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import FormRows from '../../../../shared/components/FormRows';
import TemplateForm from '../TemplateForm';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { SafeInnovationFlowVisualizer } from './SafeInnovationFlowVisualizer';
import { InnovationFlowState } from '../../../../collaboration/InnovationFlow/InnovationFlowStates/InnovationFlowStates';

export interface InnovationTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  states: InnovationFlowState[];
}

export interface InnovationTemplateFormSubmittedValues {
  states: InnovationFlowState[];
  profile: CreateProfileInput;
}

interface InnovationTemplateFormProps {
  initialValues: Partial<InnovationTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<InnovationTemplateFormValues>) => ReactNode);
  editMode?: boolean;
}

const validator = { // TODO validate states
};

const InnovationTemplateForm = ({ initialValues, visual, onSubmit, actions }: InnovationTemplateFormProps) => {
  const { t } = useTranslation();

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
          <FormikInputField
            name="definition"
            title={t('innovation-templates.definition.title')}
            placeholder={t('innovation-templates.definition.placeholder')}
            rows={11}
          />
          <Typography>{t('common.preview')}</Typography>
          <Box sx={{ maxWidth: theme => theme.spacing(64) }}>
            <SafeInnovationFlowVisualizer states={values.states} />
          </Box>
        </FormRows>
      )}
    </TemplateForm>
  );
};

export default InnovationTemplateForm;
