import { useTranslation } from 'react-i18next';
import WhiteboardTemplateForm, {
  WhiteboardTemplateFormSubmittedValuesWithPreviewImages,
  WhiteboardTemplateFormValues,
} from '../../_new/components/Forms/WhiteboardTemplateForm';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';
import CreateEditTemplateDialogBase from '../../_new/components/Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';

export interface CreateWhiteboardTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: WhiteboardTemplateFormSubmittedValuesWithPreviewImages) => void;
}
/**
 * @deprecated
 * //!! delete this folder
 */
const CreateWhiteboardTemplateDialog = ({ open, onClose, onSubmit }: CreateWhiteboardTemplateDialogProps) => {
  const { t } = useTranslation();

  const initialValues: Partial<WhiteboardTemplateFormValues> = {
    content: JSON.stringify(EmptyWhiteboard),
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <CreateEditTemplateDialogBase open={open} onClose={onClose} templateTypeName={t('templateLibrary.whiteboardTemplates.name')}>
      {({ actions }) => <WhiteboardTemplateForm initialValues={initialValues} onSubmit={onSubmit} actions={actions} />}
    </CreateEditTemplateDialogBase>
  );
};

export default CreateWhiteboardTemplateDialog;
