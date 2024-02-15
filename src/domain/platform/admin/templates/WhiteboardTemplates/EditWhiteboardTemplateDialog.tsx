import React, { useEffect } from 'react';
import { AdminWhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValuesWithPreviewImages,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import DeleteButton from '../../../../shared/components/DeleteButton';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import { DialogActions, DialogContent } from '@mui/material';

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
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t('common.edit-entity', { entity: t('templateLibrary.whiteboardTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <WhiteboardTemplateForm
          initialValues={initialValues}
          visual={template?.profile?.visual}
          onSubmit={handleSubmit}
          actions={formik => (
            <DialogFooter>
              <DialogActions>
                <DeleteButton onClick={onDelete} />
                <FormikSubmitButtonPure variant="contained" formik={formik} onClick={() => formik.handleSubmit()}>
                  {t('common.update')}
                </FormikSubmitButtonPure>
              </DialogActions>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default EditWhiteboardTemplateDialog;
