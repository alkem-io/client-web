import React, { useMemo } from 'react';
import { DialogHeaderProps } from '../../../../../../core/ui/dialog/DialogHeader';
import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '../../../../../../core/apollo/generated/graphql-schema';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';
import { getNewTemplate } from '../../../models/common';
import { AnyTemplate } from '../../../models/TemplateBase';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  templateType: TemplateType;
  defaultValues?: Partial<AnyTemplate>;
}

const CreateTemplateDialog = ({ templateType, open, onClose, defaultValues, onSubmit }: CreateTemplateDialogProps) => {
  const template = useMemo(() => getNewTemplate(templateType, defaultValues), [templateType, defaultValues]);

  return (
    <CreateEditTemplateDialogBase open={open} onClose={onClose} templateType={templateType}>
      {({ actions }) => <TemplateForm template={template} onSubmit={onSubmit} actions={actions} />}
    </CreateEditTemplateDialogBase>
  );
};

export default CreateTemplateDialog;
