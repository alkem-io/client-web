import { useTranslation } from 'react-i18next';
import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { PostTemplateFragment } from '../../../../core/apollo/generated/graphql-schema';
import TemplateDialogBase from '../../Dialogs/templateDialog/TemplateDialogBase';

interface EditPostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: PostTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
  onDelete: () => void;
  template: PostTemplateFragment | undefined;
}

const EditPostTemplateDialog = ({ template, open, onClose, onSubmit, onDelete }: EditPostTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const values: Partial<PostTemplateFormValues> = {
    defaultDescription: template.postDefaultDescription,
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
        <PostTemplateForm
          initialValues={values}
          visual={template.profile.visual}
          onSubmit={handleSubmit}
          actions={actions}
        />
      )}
    </TemplateDialogBase>
  );
};

export default EditPostTemplateDialog;
