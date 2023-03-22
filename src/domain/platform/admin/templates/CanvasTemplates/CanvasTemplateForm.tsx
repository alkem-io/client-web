import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import TemplateForm from '../TemplateForm';
import CanvasFormikSelectInput, { Canvas } from './CanvasFormikSelectInput';
import { useTranslation } from 'react-i18next';

export interface CanvasTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  value: string;
}

export interface CanvasTemplateFormSubmittedValues {
  value: string;
  tags: string[];
  visualUri: string;
  profile: CreateProfileInput;
}

interface CanvasTemplateFormProps {
  displayName: ReactNode;
  initialValues: Partial<CanvasTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: CanvasTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CanvasTemplateFormValues>) => ReactNode);
  canvases: Canvas[];
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
}

const validator = {
  value: yup.string().required(),
};

const CanvasTemplateForm = ({
  displayName,
  initialValues,
  visual,
  onSubmit,
  actions,
  canvases,
  getParentCalloutId,
}: CanvasTemplateFormProps) => {
  const { t } = useTranslation();

  return (
    <TemplateForm
      displayName={displayName}
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      <TemplateFormRows>
        <CanvasFormikSelectInput
          label={t('common.canvas')}
          name="value"
          canvases={canvases}
          getParentCalloutId={getParentCalloutId}
        />
      </TemplateFormRows>
    </TemplateForm>
  );
};

export default CanvasTemplateForm;
