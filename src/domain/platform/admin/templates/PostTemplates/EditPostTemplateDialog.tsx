import { AdminPostTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { DialogContent } from '@mui/material';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';

interface EditPostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: PostTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
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

  const handleSubmit = (values: PostTemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.postTemplates.name')}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <DialogContent>
          <PostTemplateForm
            initialValues={values}
            visual={template.profile.visual}
            onSubmit={handleSubmit}
            actions={actions}
          />
        </DialogContent>
      )}
    </TemplateDialogBase>
  );
};

export default EditPostTemplateDialog;
