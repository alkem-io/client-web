import React from 'react';
import { AdminWhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValues,
  WhiteboardTemplateFormValues,
} from './WhiteboardTemplateForm';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader, { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import DeleteButton from '../../../../shared/components/DeleteButton';
import FormikSubmitButton from '../../../../shared/components/forms/FormikSubmitButton';
import CanvasValueContainer, { CanvasLocation } from '../../../../collaboration/canvas/containers/CanvasValueContainer';

export interface EditWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }) => void;
  onDelete: () => void;
  template: AdminWhiteboardTemplateFragment | undefined;
  canvasLocation: CanvasLocation;
}

const EditWhiteboardTemplateDialog = ({
  template,
  open,
  onClose,
  onSubmit,
  onDelete,
  canvasLocation,
}: EditWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  if (!template) {
    return null;
  }

  const handleSubmit = (values: WhiteboardTemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
    });
  };

  return (
    <DialogWithGrid
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: 'background.default', minWidth: theme => theme.spacing(128) } }}
      maxWidth={false}
    >
      <DialogHeader onClose={onClose}>
        {t('common.edit-entity', { entity: t('canvas-templates.canvas-template') })}
      </DialogHeader>
      <CanvasValueContainer canvasLocation={{ ...canvasLocation, canvasId: template.id }}>
        {({ canvas: canvasValue }, { loadingCanvasValue }) => {
          const initialValues: Partial<WhiteboardTemplateFormValues> = {
            value: canvasValue?.value,
            displayName: template.profile.displayName,
            description: template.profile.description,
            tags: template.profile.tagset?.tags,
          };

          return (
            <WhiteboardTemplateForm
              initialValues={initialValues}
              visual={template?.profile?.visual}
              onSubmit={handleSubmit}
              loading={loadingCanvasValue}
              actions={
                <>
                  <DeleteButton onClick={onDelete} />
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

export default EditWhiteboardTemplateDialog;
