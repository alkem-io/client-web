import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import TemplateFormBase, {
  TemplateFormProfileSubmittedValues,
  TemplateFormWithPreviewImages,
} from './TemplateFormBase';
import FormikWhiteboardPreview from '../../../collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import { useTranslation } from 'react-i18next';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { mapTemplateProfileToUpdateProfile } from './common/mappings';
import { WhiteboardTemplate } from '../../models/WhiteboardTemplate';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';
import { useWhiteboardTemplateContentQuery } from '../../../../core/apollo/generated/apollo-hooks';

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
    content: yup.string().required(),
  }),
};

const WhiteboardTemplateForm = ({ template, onSubmit, actions }: WhiteboardTemplateFormProps) => {
  const { t } = useTranslation();
  const { data: whiteboardData, loading } = useWhiteboardTemplateContentQuery({
    variables: { whiteboardTemplateId: template?.id! },
    skip: !template?.id,
  });

  const initialValues: WhiteboardTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
    whiteboard: {
      content: whiteboardData?.lookup.template?.whiteboard?.content ?? JSON.stringify(EmptyWhiteboard),
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
        loading={loading}
        dialogProps={{ title: t('templateLibrary.whiteboardTemplates.editDialogTitle') }}
      />
    </TemplateFormBase>
  );
};

export default WhiteboardTemplateForm;
