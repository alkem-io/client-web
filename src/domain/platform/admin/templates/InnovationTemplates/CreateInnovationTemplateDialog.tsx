import InnovationTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from './InnovationTemplateForm';
import { useTranslation } from 'react-i18next';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import { InnovationFlowType } from '../../../../../core/apollo/generated/graphql-schema';
import { DialogActions, DialogContent } from '@mui/material';

interface CreatePostTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
}

const CreateInnovationTemplateDialog = ({ open, onClose, onSubmit }: CreatePostTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<InnovationTemplateFormValues> = {
    type: InnovationFlowType.Challenge,
  };

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t('common.create-new-entity', { entity: t('templateLibrary.innovationFlowTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <InnovationTemplateForm
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

export default CreateInnovationTemplateDialog;
