import { AdminCanvasTemplateFragment, CanvasDetailsFragment } from '../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import CanvasTemplateForm, { CanvasTemplateFormSubmittedValues, CanvasTemplateFormValues } from './CanvasTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';

export interface EditCanvasTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: CanvasTemplateFormSubmittedValues) => void;
  onDelete: () => void;
  template: AdminCanvasTemplateFragment | undefined;
  canvases: CanvasDetailsFragment[] | undefined;
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
}

const EditCanvasTemplateDialog = ({
  template,
  canvases,
  open,
  onClose,
  onSubmit,
  onDelete,
  getParentCalloutId,
}: EditCanvasTemplateDialogProps) => {
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
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <CanvasTemplateForm
        title={t('common.edit-entity', { entity: t('canvas-templates.canvas-template') })}
        initialValues={values}
        visual={template.info.visual}
        canvases={canvases}
        onSubmit={onSubmit}
        getParentCalloutId={getParentCalloutId}
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
