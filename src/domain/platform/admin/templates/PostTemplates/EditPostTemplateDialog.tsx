import { AdminPostTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

interface EditPostTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
  onDelete: () => void;
  template: AdminPostTemplateFragment | undefined;
}

const EditPostTemplateDialog = ({ template, open, onClose, onSubmit, onDelete }: EditPostTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const values: Partial<PostTemplateFormValues> = {
    type: template.type,
    defaultDescription: template.defaultDescription,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <PostTemplateForm
        title={t('common.edit-entity', { entity: t('aspect-templates.aspect-template') })}
        initialValues={values}
        visual={template.profile.visual}
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

export default EditPostTemplateDialog;
