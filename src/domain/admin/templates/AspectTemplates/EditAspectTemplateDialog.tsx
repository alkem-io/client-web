import { AspectTemplate } from '../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import AspectTemplateForm, { AspectTemplateFormSubmittedValues, AspectTemplateFormValues } from './AspectTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';

interface EditAspectTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: AspectTemplateFormSubmittedValues) => void;
  aspectTemplate: AspectTemplate | undefined;
}

const EditAspectTemplateDialog = ({ aspectTemplate, open, onClose, onSubmit }: EditAspectTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!aspectTemplate) {
    return null;
  }

  const values: Partial<AspectTemplateFormValues> = {
    type: aspectTemplate.type,
    defaultDescription: aspectTemplate.defaultDescription,
    title: aspectTemplate.info.title,
    description: aspectTemplate.info.description,
    tags: aspectTemplate.info.tagset?.tags,
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <AspectTemplateForm
        title={t('common.edit-entity', { entity: t('aspect-templates.aspect-template') })}
        initialValues={values}
        onSubmit={onSubmit}
        submitButtonText={t('common.update')}
      />
    </Dialog>
  );
};

export default EditAspectTemplateDialog;
