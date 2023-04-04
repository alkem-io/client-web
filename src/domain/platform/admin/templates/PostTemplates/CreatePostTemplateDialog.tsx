import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { useTranslation } from 'react-i18next';
import { Dialog } from '@mui/material';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

interface CreatePostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
}

const CreatePostTemplateDialog = ({ open, onClose, onSubmit }: CreatePostTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<PostTemplateFormValues> = {};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogHeader onClose={onClose}>
        {t('common.create-new-entity', { entity: t('aspect-templates.aspect-template') })}
      </DialogHeader>
      <PostTemplateForm
        initialValues={values}
        onSubmit={onSubmit}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </Dialog>
  );
};

export default CreatePostTemplateDialog;
