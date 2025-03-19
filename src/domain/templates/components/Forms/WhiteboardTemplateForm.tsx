import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import TemplateFormBase, {
  TemplateFormProfileSubmittedValues,
  TemplateFormWithPreviewImages,
} from './TemplateFormBase';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useTranslation } from 'react-i18next';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfile } from './common/mappings';
import { WhiteboardTemplate } from '@/domain/templates/models/WhiteboardTemplate';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';

export interface WhiteboardTemplateFormSubmittedValues
  extends TemplateFormProfileSubmittedValues,
    TemplateFormWithPreviewImages {
  whiteboard?: {
    content: string;
  };
}

interface WhiteboardTemplateFormProps {
  template?: WhiteboardTemplate;
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<WhiteboardTemplateFormSubmittedValues>) => ReactNode);
}

const validator = {
  whiteboard: yup.object().shape({
    content: yup.string(),
  }),
};

const WhiteboardTemplateForm = ({ template, onSubmit, actions }: WhiteboardTemplateFormProps) => {
  const { t } = useTranslation();

  const initialValues: WhiteboardTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
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

export default WhiteboardTemplateForm;
