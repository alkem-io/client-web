import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValues,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';
import EmptyWhiteboard from '../../../../../common/components/composite/entities/Canvas/EmptyWhiteboard';

export interface CreateWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
}

const CreateWhiteboardTemplateDialog = ({ open, onClose, onSubmit }: CreateWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  const initialValues: Partial<WhiteboardTemplateFormValues> = {
    value: JSON.stringify(EmptyWhiteboard),
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <DialogWithGrid
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogHeader onClose={onClose}>
        {t('common.create-new-entity', { entity: t('canvas-templates.canvas-template') })}
      </DialogHeader>

      <WhiteboardTemplateForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        actions={
          <>
            <FormikSubmitButton variant="contained">{t('common.update')}</FormikSubmitButton>
          </>
        }
      />
    </DialogWithGrid>
  );
};

export default CreateWhiteboardTemplateDialog;
