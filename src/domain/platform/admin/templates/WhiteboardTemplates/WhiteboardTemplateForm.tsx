import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import TemplateForm from '../TemplateForm';
import CanvasFormikSelectInput, { Canvas } from './WhiteboardFormikSelectInput';
import { useTranslation } from 'react-i18next';

export interface WhiteboardTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  value: string;
}

export interface WhiteboardTemplateFormSubmittedValues {
  value: string;
  tags?: string[];
  visualUri?: string;
  profile: CreateProfileInput;
}

interface WhiteboardTemplateFormProps {
  displayName: ReactNode;
  initialValues: Partial<WhiteboardTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<WhiteboardTemplateFormValues>) => ReactNode);
  canvases: Canvas[];
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
}

const validator = {
  value: yup.string().required(),
};

const WhiteboardTemplateForm = ({
  displayName,
  initialValues,
  visual,
  onSubmit,
  actions,
  canvases,
  getParentCalloutId,
}: WhiteboardTemplateFormProps) => {
  const { t } = useTranslation();

  return (
    <TemplateForm
      title={displayName}
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

export default WhiteboardTemplateForm;
