import {
  AdminWhiteboardTemplateFragment,
  AdminWhiteboardTemplateValueFragment,
  CanvasDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValues,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import Dialog from '@mui/material/Dialog';
import React, { useEffect } from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

export interface EditWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
  onDelete: () => void;
  template: AdminWhiteboardTemplateFragment | undefined;
  getTemplateValue: (template: AdminWhiteboardTemplateFragment) => void;
  templateValue: AdminWhiteboardTemplateValueFragment | undefined;
  canvases: CanvasDetailsFragment[];
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
}

const EditWhiteboardTemplateDialog = ({
  template,
  canvases,
  open,
  onClose,
  onSubmit,
  onDelete,
  getParentCalloutId,
  getTemplateValue,
  templateValue,
}: EditWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!template) return;

    getTemplateValue(template);
  }, [getTemplateValue, template]);

  if (!template) {
    return null;
  }

  const values: Partial<WhiteboardTemplateFormValues> = {
    value: templateValue?.value,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: WhiteboardTemplateFormSubmittedValues) => {
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
      <WhiteboardTemplateForm
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

export default EditWhiteboardTemplateDialog;
