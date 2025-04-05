import { useEffect, useState } from 'react';
import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import TemplateForm, { AnyTemplateFormSubmittedValues } from '@/domain/templates/components/Forms/TemplateForm';
import { getNewTemplate } from '@/domain/templates/models/common';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { Box, CircularProgress } from '@mui/material';
import ConfirmationDialog from '@/_deprecated/ConfirmationDialog';
import { useTranslation } from 'react-i18next';

interface CreateTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  templateType: TemplateType;
  getDefaultValues?: () => Promise<Partial<AnyTemplate>>;
  temporaryLocation?: boolean;
}

const CreateTemplateDialog = ({
  templateType,
  open,
  onClose,
  getDefaultValues,
  onSubmit,
  temporaryLocation = false,
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
            {defaultValues && (
              <TemplateForm
                template={defaultValues}
                onSubmit={onSubmit}
                actions={actions}
                temporaryLocation={temporaryLocation}
              />
            )}
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
          onConfirm: () => {
            onClose?.();
            setConfirmCloseDialogOpen(false);
          },
        }}
        options={{
          show: confirmCloseDialogOpen,
        }}
      />
    </>
  );
};

export default CreateTemplateDialog;
