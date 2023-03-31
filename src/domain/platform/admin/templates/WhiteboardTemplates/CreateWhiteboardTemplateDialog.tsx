import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValues,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import Dialog from '../../../../../core/ui/dialog/Dialog';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React, { useMemo } from 'react';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';
import { CanvasDetailsFragment } from '../../../../../core/apollo/generated/graphql-schema';

export interface CreateWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
  canvases: CanvasDetailsFragment[];
  getParentCalloutId: (canvasNameId: string | undefined) => string | undefined;
}

const CreateWhiteboardTemplateDialog = ({
  canvases,
  open,
  onClose,
  onSubmit,
  getParentCalloutId,
}: CreateWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<WhiteboardTemplateFormValues> = useMemo(() => ({}), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', width: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogHeader onClose={onClose}>
        {t('common.create-new-entity', { entity: t('canvas-templates.canvas-template') })}
      </DialogHeader>

      <WhiteboardTemplateForm
        initialValues={values}
        canvases={canvases}
        onSubmit={onSubmit}
        getParentCalloutId={getParentCalloutId}
        actions={<FormikSubmitButton variant="contained">{t('common.create')}</FormikSubmitButton>}
      />
    </Dialog>
  );
};

export default CreateWhiteboardTemplateDialog;
