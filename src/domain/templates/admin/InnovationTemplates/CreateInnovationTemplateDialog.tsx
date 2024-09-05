import InnovationFlowTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from '../../_new/components/Forms/InnovationFlowTemplateForm';
import { useTranslation } from 'react-i18next';
import React from 'react';
import CreateEditTemplateDialogBase from '../../_new/components/Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';
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
    <CreateEditTemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.innovationFlowTemplates.name')}
    >
      {({ actions }) => <InnovationFlowTemplateForm initialValues={values} onSubmit={onSubmit} actions={actions} />}
    </CreateEditTemplateDialogBase>
  );
};

export default CreateInnovationTemplateDialog;
