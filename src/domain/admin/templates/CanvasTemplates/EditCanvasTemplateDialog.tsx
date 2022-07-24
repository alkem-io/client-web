import { AdminCanvasTemplateFragment } from '../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import CanvasTemplateForm, { CanvasTemplateFormSubmittedValues, CanvasTemplateFormValues } from './CanvasTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';

interface EditCanvasTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: CanvasTemplateFormSubmittedValues) => void;
  onDelete: () => void;
  template: AdminCanvasTemplateFragment | undefined;
}

const EditCanvasTemplateDialog = ({ template, open, onClose, onSubmit, onDelete }: EditCanvasTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const values: Partial<CanvasTemplateFormValues> = {
    value: template.value,
    title: template.info.title,
    description: template.info.description,
    tags: template.info.tagset?.tags,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default' } }}
      maxWidth={false}
    >
      <CanvasTemplateForm
        title={t('common.edit-entity', { entity: t('canvas-templates.canvas-template') })}
        initialValues={values}
        visual={template.info.visual}
        onSubmit={onSubmit}
        actions={
          <>
            <DeleteButton onClick={onDelete} />
            <FormikSubmitButton variant="contained">{t('common.update')}</FormikSubmitButton>
          </>
        }
      />
    </Dialog>
  );
};

export default EditCanvasTemplateDialog;
