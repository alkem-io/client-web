import * as yup from 'yup';
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
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { TemplateFormActions } from '../Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';

interface TemplateContentWhiteboard {
  content: string;
  preview?: {
    name: VisualType.WhiteboardPreview;
    uri: string;
  };
}

export interface TemplateWhiteboardFormSubmittedValues
  extends TemplateFormProfileSubmittedValues,
    TemplateFormWithPreviewImages {
  whiteboard?: TemplateContentWhiteboard;
}

interface TemplateWhiteboardFormProps {
  template?: WhiteboardTemplate;
  onSubmit: (values: TemplateWhiteboardFormSubmittedValues) => void;
  actions: TemplateFormActions<TemplateWhiteboardFormSubmittedValues>;
}

const validator = {
  whiteboard: yup.object().shape({
    content: textLengthValidator(),
  }),
};

const TemplateWhiteboardForm = ({ template, onSubmit, actions }: TemplateWhiteboardFormProps) => {
  const { t } = useTranslation();

  const initialValues: TemplateWhiteboardFormSubmittedValues = {
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

export default TemplateWhiteboardForm;
