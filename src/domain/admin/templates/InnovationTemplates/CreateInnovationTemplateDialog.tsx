import { DialogProps } from '@mui/material';
import InnovationTemplateForm, {
  InnovationTemplateFormSubmittedValues,
  InnovationTemplateFormValues,
} from './InnovationTemplateForm';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import FormikSubmitButton from '../../../shared/components/forms/FormikSubmitButton';
import { LifecycleType } from '../../../../models/graphql-schema';

interface CreateAspectTemplateDialogProps {
  open: boolean;
  onClose: DialogProps['onClose'];
  onSubmit: (values: InnovationTemplateFormSubmittedValues) => void;
}

const CreateInnovationTemplateDialog = ({ open, onClose, onSubmit }: CreateAspectTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<InnovationTemplateFormValues> = {
    type: LifecycleType.Challenge,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <InnovationTemplateForm
        title={t('common.create-new-entity', { entity: t('innovation-templates.innovation-template') })}
        initialValues={values}
        onSubmit={onSubmit}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </Dialog>
  );
};

export default CreateInnovationTemplateDialog;
