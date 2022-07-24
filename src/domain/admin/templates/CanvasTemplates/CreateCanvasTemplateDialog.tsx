import { useTranslation } from 'react-i18next';
import CanvasTemplateForm, { CanvasTemplateFormSubmittedValues, CanvasTemplateFormValues } from './CanvasTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';

interface CreateCanvasTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: CanvasTemplateFormSubmittedValues) => void;
}

const CreateCanvasTemplateDialog = ({ open, onClose, onSubmit }: CreateCanvasTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<CanvasTemplateFormValues> = {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default' } }}
      maxWidth={false}
    >
      <CanvasTemplateForm
        title={t('common.create-new-entity', { entity: t('canvas-templates.canvas-template') })}
        initialValues={values}
        onSubmit={onSubmit}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </Dialog>
  );
};

export default CreateCanvasTemplateDialog;
