import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValues,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';
import CanvasValueContainer, { CanvasLocation } from '../../../../collaboration/canvas/containers/CanvasValueContainer';

export interface CreateWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
  canvasLocation: CanvasLocation;
}

const CreateWhiteboardTemplateDialog = ({
  open,
  onClose,
  onSubmit,
  canvasLocation,
}: CreateWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

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
      <CanvasValueContainer canvasLocation={{ ...canvasLocation, isNew: true }}>
        {({ canvas: canvasValue }, { loadingCanvasValue }) => {
          const initialValues: Partial<WhiteboardTemplateFormValues> = {
            value: canvasValue?.value,
            displayName: '',
            description: '',
            tags: [],
          };
          return (
            <WhiteboardTemplateForm
              initialValues={initialValues}
              onSubmit={onSubmit}
              loading={loadingCanvasValue}
              actions={
                <>
                  <FormikSubmitButton variant="contained">{t('common.update')}</FormikSubmitButton>
                </>
              }
            />
          );
        }}
      </CanvasValueContainer>
    </DialogWithGrid>
  );
};

export default CreateWhiteboardTemplateDialog;
