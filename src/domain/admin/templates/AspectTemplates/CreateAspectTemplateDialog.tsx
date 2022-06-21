import { DialogProps } from '@mui/material';
import AspectTemplateForm, { AspectTemplateFormSubmittedValues, AspectTemplateFormValues } from './AspectTemplateForm';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import React from 'react';

interface CreateAspectTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: AspectTemplateFormSubmittedValues) => void;
}

const CreateAspectTemplateDialog = ({ open, onClose, onSubmit }: CreateAspectTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<AspectTemplateFormValues> = {};

  return (
    <Dialog open={open} onClose={onClose}>
      <AspectTemplateForm
        title={t('common.create-new-entity', { entity: t('aspect-templates.aspect-template') })}
        initialValues={values}
        onSubmit={onSubmit}
        submitButtonText={t('common.create')}
      />
    </Dialog>
  );
};

export default CreateAspectTemplateDialog;
