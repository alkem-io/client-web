import { AdminAspectTemplateFragment } from '../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import AspectTemplateForm, { AspectTemplateFormSubmittedValues, AspectTemplateFormValues } from './AspectTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';

interface EditAspectTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: AspectTemplateFormSubmittedValues) => void;
  onDelete: () => void;
  aspectTemplate: AdminAspectTemplateFragment | undefined;
}

const EditAspectTemplateDialog = ({
  aspectTemplate,
  open,
  onClose,
  onSubmit,
  onDelete,
}: EditAspectTemplateDialogProps) => {
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
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default' } }}
      maxWidth={false}
    >
      <AspectTemplateForm
        title={t('common.edit-entity', { entity: t('aspect-templates.aspect-template') })}
        initialValues={values}
        visual={aspectTemplate.info.visual}
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

export default EditAspectTemplateDialog;
