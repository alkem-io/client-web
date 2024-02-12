import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValuesWithPreviewImages,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import EmptyWhiteboard from '../../../../common/whiteboard/EmptyWhiteboard';
import { DialogActions, DialogContent } from '@mui/material';

export interface CreateWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValuesWithPreviewImages) => void;
}

const CreateWhiteboardTemplateDialog = ({ open, onClose, onSubmit }: CreateWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  const initialValues: Partial<WhiteboardTemplateFormValues> = {
    content: JSON.stringify(EmptyWhiteboard),
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t('common.create-new-entity', { entity: t('templateLibrary.whiteboardTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <WhiteboardTemplateForm
          initialValues={initialValues}
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

export default CreateWhiteboardTemplateDialog;
