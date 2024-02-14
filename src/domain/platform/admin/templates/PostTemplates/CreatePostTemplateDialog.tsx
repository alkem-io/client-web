import PostTemplateForm, { PostTemplateFormSubmittedValues, PostTemplateFormValues } from './PostTemplateForm';
import { useTranslation } from 'react-i18next';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import { DialogActions, DialogContent } from '@mui/material';

interface CreatePostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
}

const CreatePostTemplateDialog = ({ open, onClose, onSubmit }: CreatePostTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<PostTemplateFormValues> = {};

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t('common.create-new-entity', { entity: t('templateLibrary.postTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <PostTemplateForm
          initialValues={values}
          onSubmit={onSubmit}
          actions={formik => (
            <DialogFooter>
              <DialogActions>
                <FormikSubmitButtonPure variant="contained" formik={formik} onClick={() => formik.handleSubmit()}>
                  {t('common.create')}
                </FormikSubmitButtonPure>
              </DialogActions>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CreatePostTemplateDialog;
