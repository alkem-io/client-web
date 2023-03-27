import { AdminInnovationFlowTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import InnovationTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from './InnovationTemplateForm';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { DialogProps } from '@mui/material';
import DeleteButton from '../../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';

interface EditInnovationTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
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
    type: template.type,
    definition: template.definition,
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <InnovationTemplateForm
        title={t('common.edit-entity', { entity: t('innovation-templates.innovation-template') })}
        initialValues={values}
        visual={template.profile.visual}
        onSubmit={onSubmit}
        actions={
          <>
            <DeleteButton onClick={onDelete} />
            <FormikSubmitButton variant="contained">{t('common.update')}</FormikSubmitButton>
          </>
        }
      />
    </Dialog>
  );
};

export default EditInnovationTemplateDialog;
