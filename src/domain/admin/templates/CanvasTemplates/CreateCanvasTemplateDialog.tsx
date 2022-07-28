import { useTranslation } from 'react-i18next';
import CanvasTemplateForm, { CanvasTemplateFormSubmittedValues, CanvasTemplateFormValues } from './CanvasTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';
import { CanvasDetailsFragment } from '../../../../models/graphql-schema';

export interface CreateCanvasTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: CanvasTemplateFormSubmittedValues) => void;
  canvases: CanvasDetailsFragment[] | undefined;
}

const CreateCanvasTemplateDialog = ({ canvases, open, onClose, onSubmit }: CreateCanvasTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<CanvasTemplateFormValues> = {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <CanvasTemplateForm
        title={t('common.create-new-entity', { entity: t('canvas-templates.canvas-template') })}
        initialValues={values}
        canvases={canvases}
        onSubmit={onSubmit}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </Dialog>
  );
};

export default CreateCanvasTemplateDialog;
