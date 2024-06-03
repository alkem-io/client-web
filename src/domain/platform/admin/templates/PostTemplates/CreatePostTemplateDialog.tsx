import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { DialogContent } from '@mui/material';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';

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
      {({ actions }) => (
        <DialogContent>
          <PostTemplateForm initialValues={values} onSubmit={onSubmit} actions={actions} />
        </DialogContent>
      )}
    </TemplateDialogBase>
  );
};

export default CreatePostTemplateDialog;
