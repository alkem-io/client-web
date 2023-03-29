import {
  AdminCanvasTemplateFragment,
  AdminCanvasTemplateValueFragment,
  CanvasDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import CanvasTemplateForm, { CanvasTemplateFormSubmittedValues, CanvasTemplateFormValues } from './CanvasTemplateForm';
import Dialog from '@mui/material/Dialog';
import React, { useEffect } from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

export interface EditCanvasTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: CanvasTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
  onDelete: () => void;
  template: AdminCanvasTemplateFragment | undefined;
  getTemplateValue: (template: AdminCanvasTemplateFragment) => void;
  templateValue: AdminCanvasTemplateValueFragment | undefined;
  canvases: CanvasDetailsFragment[];
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
  getTemplateValue,
  templateValue,
}: EditCanvasTemplateDialogProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!template) return;

    getTemplateValue(template);
  }, [getTemplateValue, template]);

  if (!template) {
    return null;
  }

  const values: Partial<CanvasTemplateFormValues> = {
    value: templateValue?.value,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: CanvasTemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <CanvasTemplateForm
        displayName={t('common.edit-entity', { entity: t('canvas-templates.canvas-template') })}
        initialValues={values}
        visual={template.profile.visual}
        canvases={canvases}
        onSubmit={handleSubmit}
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
