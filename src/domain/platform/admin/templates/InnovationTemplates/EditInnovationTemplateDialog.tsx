import { AdminInnovationFlowTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import InnovationFlowTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from './InnovationFlowTemplateForm';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';

interface EditInnovationTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: InnovationTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
  onDelete: () => void;
  template: AdminInnovationFlowTemplateFragment | undefined;
}

const EditInnovationTemplateDialog = ({
  template,
  open,
  onClose,
  onSubmit,
  onDelete,
}: EditInnovationTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const values: Partial<InnovationTemplateFormValues> = {
    states: template.states,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: InnovationTemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.innovationFlowTemplates.name')}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => <InnovationFlowTemplateForm initialValues={values} onSubmit={handleSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default EditInnovationTemplateDialog;
