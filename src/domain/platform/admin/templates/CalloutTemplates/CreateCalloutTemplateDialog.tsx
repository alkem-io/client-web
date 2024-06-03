import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import CalloutTemplateForm, {
  CalloutTemplateFormSubmittedValues,
  CalloutTemplateFormValues,
} from './CalloutTemplateForm';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';

export interface CreateCalloutTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
}

const CreateCalloutTemplateDialog = ({ open, onClose, onSubmit }: CreateCalloutTemplateDialogProps) => {
  const { t } = useTranslation();

  const initialValues: Partial<CalloutTemplateFormValues> = {
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <TemplateDialogBase open={open} onClose={onClose} templateTypeName={t('templateLibrary.calloutTemplates.name')}>
      {({ actions }) => <CalloutTemplateForm initialValues={initialValues} onSubmit={onSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default CreateCalloutTemplateDialog;
