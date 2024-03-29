import { AdminInnovationFlowTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import InnovationFlowTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from './InnovationFlowTemplateForm';
import DialogWithGrid, { DialogFooter } from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import DeleteButton from '../../../../shared/components/DeleteButton';
import { FormikSubmitButtonPure } from '../../../../shared/components/forms/FormikSubmitButton';
import { DialogActions, DialogContent } from '@mui/material';

interface EditInnovationTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: InnovationTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
  onDelete: () => void;
  template: AdminInnovationFlowTemplateFragment | undefined;
}

const EditInnovationTemplateDialog = ({
  template,
  open,
  onClose,
  onSubmit,
  onDelete,
}: EditInnovationTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const values: Partial<InnovationTemplateFormValues> = {
    states: template.states,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: InnovationTemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <DialogWithGrid columns={12} open={open} onClose={onClose}>
      <DialogHeader
        title={t('common.edit-entity', { entity: t('templateLibrary.innovationFlowTemplates.name') })}
        onClose={onClose}
      />
      <DialogContent>
        <InnovationFlowTemplateForm
          initialValues={values}
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

export default EditInnovationTemplateDialog;
