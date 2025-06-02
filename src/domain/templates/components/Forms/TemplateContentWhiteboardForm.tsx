import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import TemplateFormBase, {
  TemplateFormProfileSubmittedValues,
  TemplateFormWithPreviewImages,
} from './TemplateFormBase';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useTranslation } from 'react-i18next';
import { TemplateType, VisualType } from '@/core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { WhiteboardTemplate } from '@/domain/templates/models/WhiteboardTemplate';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';

export interface TemplateContentWhiteboardFormSubmittedValues
  extends TemplateFormProfileSubmittedValues,
    TemplateFormWithPreviewImages {
  whiteboard?: {
    content: string;
    preview?: {
      name: VisualType.Banner;
      uri: string;
    };
  };
}

interface TemplateContentWhiteboardFormProps {
  template?: WhiteboardTemplate;
  onSubmit: (values: TemplateContentWhiteboardFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateContentWhiteboardFormSubmittedValues>) => ReactNode);
}

const validator = {
  whiteboard: yup.object().shape({
    content: yup.string(),
  }),
};

const TemplateContentWhiteboardForm = ({ template, onSubmit, actions }: TemplateContentWhiteboardFormProps) => {
  const { t } = useTranslation();

  const initialValues: TemplateContentWhiteboardFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
    whiteboard: {
      content: template?.whiteboard?.content || JSON.stringify(EmptyWhiteboard),
    },
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Whiteboard}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      <FormikWhiteboardPreview
        name="whiteboard.content"
        previewImagesName="whiteboardPreviewImages"
        canEdit
        dialogProps={{ title: t('templateLibrary.whiteboardTemplates.editDialogTitle') }}
      />
    </TemplateFormBase>
  );
};

export default TemplateContentWhiteboardForm;
