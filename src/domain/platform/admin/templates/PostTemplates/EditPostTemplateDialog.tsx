import { AdminPostTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import DeleteButton from '../../../../shared/components/DeleteButton';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import { DialogActions, DialogContent } from '@mui/material';

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
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t('common.edit-entity', { entity: t('templateLibrary.postTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <PostTemplateForm
          initialValues={values}
          visual={template.profile.visual}
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

export default EditPostTemplateDialog;
