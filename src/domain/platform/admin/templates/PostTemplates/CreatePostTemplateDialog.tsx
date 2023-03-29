import { DialogProps } from '@mui/material';
import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

interface CreatePostTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
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
      <PostTemplateForm
        title={t('common.create-new-entity', { entity: t('aspect-templates.aspect-template') })}
        initialValues={values}
        onSubmit={onSubmit}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </Dialog>
  );
};

export default CreatePostTemplateDialog;
