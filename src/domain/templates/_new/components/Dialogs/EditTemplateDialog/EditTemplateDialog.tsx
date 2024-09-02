import React from 'react';
import { DialogHeaderProps } from '../../../../../../core/ui/dialog/DialogHeader';

import TemplateDialogBase from '../TemplateDialogBase';
import { TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../../models/TemplateBase';
import TemplateForm, { TemplateFormSubmittedValues } from '../../Forms/TemplateForm';

interface EditTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: TemplateFormSubmittedValues) => void;
  onDelete: () => void;
  template: AnyTemplate | undefined;
  templateType: TemplateType;
}

const EditTemplateDialog = ({ template, templateType, open, onClose, onSubmit, onDelete }: EditTemplateDialogProps) => {
  if (!template) {
    return null;
  }

  const handleSubmit = (values: TemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateType={templateType}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <TemplateForm
          template={template}
          templateType={templateType}
          onSubmit={handleSubmit}
          actions={actions}
          validator={undefined}
        />
      )}
    </TemplateDialogBase>
  );
};

export default EditTemplateDialog;
