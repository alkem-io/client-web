import React from 'react';
import { DialogHeaderProps } from '../../../../../../core/ui/dialog/DialogHeader';

import TemplateDialogBase from '../TemplateDialogBase';
import { TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../../models/TemplateBase';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';

interface EditTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  onDelete?: () => void;
  template: AnyTemplate | undefined;
  templateType: TemplateType;
}

const EditTemplateDialog = ({ template, templateType, open, onClose, onSubmit, onDelete }: EditTemplateDialogProps) => {
  if (!template) {
    return null;
  }

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
          onSubmit={onSubmit}
          actions={actions}
        />
      )}
    </TemplateDialogBase>
  );
};

export default EditTemplateDialog;
