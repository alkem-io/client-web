import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValuesWithPreviewImages,
  WhiteboardTemplateFormValues,
} from '../../_new/components/Forms/WhiteboardTemplateForm';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import { WhiteboardTemplateFragment } from '../../../../core/apollo/generated/graphql-schema';
import TemplateDialogBase from '../../_new/components/Dialogs/TemplateDialogBase';

export interface EditWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (
    values: WhiteboardTemplateFormSubmittedValuesWithPreviewImages & { tagsetId: string | undefined; tags?: string[] }
  ) => void;
  onDelete: () => void;
  template: WhiteboardTemplateFragment | undefined;
  getTemplateContent: (template: WhiteboardTemplateFragment) => void;
  templateContent: { content: string | undefined } | undefined;
}

const EditWhiteboardTemplateDialog = ({
  template,
  open,
  onClose,
  onSubmit,
  onDelete,
  getTemplateContent,
  templateContent,
}: EditWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!template) return;

    getTemplateContent(template);
  }, [getTemplateContent, template]);

  if (!template) {
    return null;
  }

  const initialValues: Partial<WhiteboardTemplateFormValues> = {
    content: templateContent?.content,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: WhiteboardTemplateFormSubmittedValuesWithPreviewImages) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.whiteboardTemplates.name')}
      editMode
      onDelete={onDelete}
    >
      {({ actions }) => (
        <WhiteboardTemplateForm
          initialValues={initialValues}
          visual={template?.profile?.visual}
          onSubmit={handleSubmit}
          actions={actions}
        />
      )}
    </TemplateDialogBase>
  );
};

export default EditWhiteboardTemplateDialog;
