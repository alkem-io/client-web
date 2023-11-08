import { useTranslation } from 'react-i18next';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';
import CalloutTemplateForm, {
  CalloutTemplateFormSubmittedValues,
  CalloutTemplateFormValues,
} from './CalloutTemplateForm';

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
    <DialogWithGrid
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogHeader onClose={onClose}>
        {t('common.create-new-entity', { entity: t('templateLibrary.calloutTemplates.name') })}
      </DialogHeader>
      <CalloutTemplateForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </DialogWithGrid>
  );
};

export default CreateCalloutTemplateDialog;
