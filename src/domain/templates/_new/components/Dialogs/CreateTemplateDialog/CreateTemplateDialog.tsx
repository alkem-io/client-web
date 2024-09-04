import React, { useMemo } from 'react';
import { DialogHeaderProps } from '../../../../../../core/ui/dialog/DialogHeader';
import TemplateDialogBase from '../TemplateDialogBase';
import { TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';
import { getNewTemplate } from '../../../models/common';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  templateType: TemplateType;
}

const CreateTemplateDialog = ({ templateType, open, onClose, onSubmit }: CreateTemplateDialogProps) => {
  const template = useMemo(() => getNewTemplate(templateType), [templateType]);

  return (
    <TemplateDialogBase open={open} onClose={onClose} templateType={templateType}>
      {({ actions }) => <TemplateForm template={template} onSubmit={onSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default CreateTemplateDialog;
