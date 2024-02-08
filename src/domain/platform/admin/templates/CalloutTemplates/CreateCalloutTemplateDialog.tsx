import { useTranslation } from 'react-i18next';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import CalloutTemplateForm, {
  CalloutTemplateFormSubmittedValues,
  CalloutTemplateFormValues,
} from './CalloutTemplateForm';
import { DialogContent } from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Actions } from '../../../../../core/ui/actions/Actions';

export interface CreateCalloutTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
}

const CreateCalloutTemplateDialog = ({ open, onClose, onSubmit }: CreateCalloutTemplateDialogProps) => {
  const { t } = useTranslation();

  const initialValues: Partial<CalloutTemplateFormValues> = {
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader
        title={t('common.create-new-entity', { entity: t('templateLibrary.calloutTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <CalloutTemplateForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          actions={formik => (
            <DialogFooter>
              <Actions padding={gutters()} justifyContent="end">
                <FormikSubmitButtonPure formik={formik} variant="contained" onClick={() => formik.handleSubmit()}>
                  {t('common.create')}
                </FormikSubmitButtonPure>
              </Actions>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default CreateCalloutTemplateDialog;
