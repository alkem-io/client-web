import React, { useEffect } from 'react';
import { AdminWhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValuesWithPreviewImages,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import DeleteButton from '../../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

export interface EditWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (
    values: WhiteboardTemplateFormSubmittedValuesWithPreviewImages & { tagsetId: string | undefined; tags?: string[] }
  ) => void;
  onDelete: () => void;
  template: AdminWhiteboardTemplateFragment | undefined;
  getTemplateContent: (template: AdminWhiteboardTemplateFragment) => void;
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
    <DialogWithGrid
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogHeader onClose={onClose}>
        {t('common.edit-entity', { entity: t('templateLibrary.whiteboardTemplates.name') })}
      </DialogHeader>
      <WhiteboardTemplateForm
        initialValues={initialValues}
        visual={template?.profile?.visual}
        onSubmit={handleSubmit}
        actions={
          <>
            <DeleteButton onClick={onDelete} />
            <FormikSubmitButton variant="contained">{t('common.update')}</FormikSubmitButton>
          </>
        }
      />
    </DialogWithGrid>
  );
};

export default EditWhiteboardTemplateDialog;
