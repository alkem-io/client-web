import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import TemplateForm from '../TemplateForm';
import FormikWhiteboardPreview from './FormikWhiteboardPreview';
import { useTranslation } from 'react-i18next';
import { WhiteboardPreviewImage } from '../../../../collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

export interface WhiteboardTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  value: string;
}

export interface WhiteboardTemplateFormSubmittedValues {
  value: string;
  visualUri?: string;
  profile: CreateProfileInput;
  tags?: string[];
}

export interface WhiteboardTemplateFormSubmittedValuesWithPreviewImages extends WhiteboardTemplateFormSubmittedValues {
  previewImages?: WhiteboardPreviewImage[];
}

interface WhiteboardTemplateFormProps {
  initialValues: Partial<WhiteboardTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<WhiteboardTemplateFormValues>) => ReactNode);
  loading?: boolean;
}

const validator = {
  value: yup.string().required(),
};

const WhiteboardTemplateForm = ({ initialValues, visual, onSubmit, actions, loading }: WhiteboardTemplateFormProps) => {
  const { t } = useTranslation();

  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      <TemplateFormRows>
        <FormikWhiteboardPreview
          name="value"
          previewImagesName="previewImages"
          canEdit
          loading={loading}
          dialogProps={{ title: t('whiteboard-templates.edit-dialog-title') }}
        />
      </TemplateFormRows>
    </TemplateForm>
  );
};

export default WhiteboardTemplateForm;
