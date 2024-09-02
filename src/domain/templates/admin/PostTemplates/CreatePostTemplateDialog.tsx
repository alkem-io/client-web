import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import TemplateDialogBase from '../../_new/components/Dialogs/TemplateDialogBase';

interface CreatePostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
}

const CreatePostTemplateDialog = ({ open, onClose, onSubmit }: CreatePostTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<PostTemplateFormValues> = {};

  return (
    <TemplateDialogBase open={open} onClose={onClose} templateTypeName={t('templateLibrary.postTemplates.name')}>
      {({ actions }) => <PostTemplateForm initialValues={values} onSubmit={onSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default CreatePostTemplateDialog;
