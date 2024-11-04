import React, { useEffect, useState } from 'react';
import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';
import { getNewTemplate } from '../../../models/common';
import { AnyTemplate } from '../../../models/TemplateBase';
import { Box, CircularProgress } from '@mui/material';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import { useTranslation } from 'react-i18next';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  templateType: TemplateType;
  getDefaultValues?: () => Promise<Partial<AnyTemplate>>;
}

const CreateTemplateDialog = ({
  templateType,
  open,
  onClose,
  getDefaultValues,
  onSubmit,
}: CreateTemplateDialogProps) => {
  const { t } = useTranslation();
  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState<boolean>(false);
  const [defaultValues, setDefaultValues] = useState<AnyTemplate | undefined>();
  useEffect(() => {
    (async () => {
      if (open) {
        if (getDefaultValues) {
          setDefaultValues(getNewTemplate(templateType, await getDefaultValues()));
        } else {
          setDefaultValues(getNewTemplate(templateType));
        }
      }
    })();
  }, [open]);

  const handleClose = () => {
    setConfirmCloseDialogOpen(true);
  };

  return (
    <>
      <CreateEditTemplateDialogBase open={open} onClose={handleClose} templateType={templateType}>
        {({ actions }) => (
          <>
            {!defaultValues && (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            )}
            {defaultValues && <TemplateForm template={defaultValues} onSubmit={onSubmit} actions={actions} />}
          </>
        )}
      </CreateEditTemplateDialogBase>
      <ConfirmationDialog
        entities={{
          title: t('templateLibrary.importTemplateDialog.confirmClose.title'),
          content: t('templateLibrary.importTemplateDialog.confirmClose.description'),
          confirmButtonText: t('buttons.yesDiscard'),
        }}
        actions={{
          onCancel: () => setConfirmCloseDialogOpen(false),
          onConfirm: () => onClose?.(),
        }}
        options={{
          show: confirmCloseDialogOpen,
        }}
      />
    </>
  );
};

export default CreateTemplateDialog;
