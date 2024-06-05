import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
  CommunityGuidelinesTemplateFormValues,
} from './CommunityGuidelinesTemplateForm';

interface CreateCommunityGuidelinesTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: CommunityGuidelinesTemplateFormSubmittedValues) => void;
}

const CreateCommunityGuidelinesTemplateDialog = ({
  open,
  onClose,
  onSubmit,
}: CreateCommunityGuidelinesTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: Partial<CommunityGuidelinesTemplateFormValues> = {};

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.communityGuidelinesTemplates.name')}
    >
      {({ actions }) => (
        <DialogContent>
          <CommunityGuidelinesTemplateForm initialValues={values} onSubmit={onSubmit} actions={actions} />
        </DialogContent>
      )}
    </TemplateDialogBase>
  );
};

export default CreateCommunityGuidelinesTemplateDialog;