import InnovationFlowTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from '../../_new/components/Forms/InnovationFlowTemplateForm';
import { useTranslation } from 'react-i18next';
import React from 'react';
import TemplateDialogBase from '../../_new/components/Dialogs/TemplateDialogBase';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';

interface CreatePostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
}

const CreateInnovationTemplateDialog = ({ open, onClose, onSubmit }: CreatePostTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<InnovationTemplateFormValues> = {
    states: [],
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.innovationFlowTemplates.name')}
    >
      {({ actions }) => <InnovationFlowTemplateForm initialValues={values} onSubmit={onSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default CreateInnovationTemplateDialog;
