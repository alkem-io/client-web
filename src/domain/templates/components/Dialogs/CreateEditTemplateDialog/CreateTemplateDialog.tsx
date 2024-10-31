import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Box, CircularProgress } from '@mui/material';

import CreateEditTemplateDialogBase from './CreateEditTemplateDialogBase';
import ConfirmationDialog from '../../../../../core/ui/dialogs/ConfirmationDialog';
import TemplateForm, { type AnyTemplateFormSubmittedValues } from '../../Forms/TemplateForm';

import { getNewTemplate } from '../../../models/common';
import { type AnyTemplate } from '../../../models/TemplateBase';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';

const CreateTemplateDialog = ({
  open,
  templateType,
  getDefaultValues,
  temporaryLocation = false,
  onClose,
  onSubmit,
}: CreateTemplateDialogProps) => {
  const [defaultValues, setDefaultValues] = useState<AnyTemplate | undefined>();
  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState<boolean>(false);

  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      if (open) {
        getDefaultValues
          ? setDefaultValues(getNewTemplate(templateType, await getDefaultValues()))
          : setDefaultValues(getNewTemplate(templateType));
      }
    })();
  }, [open]);

  return (
    <>
      <CreateEditTemplateDialogBase
        open={open}
        templateType={templateType}
        onClose={() => setConfirmCloseDialogOpen(true)}
      >
        {({ actions }) => (
          <>
            {defaultValues ? (
              <TemplateForm
                actions={actions}
                template={defaultValues}
                temporaryLocation={temporaryLocation}
                onSubmit={onSubmit}
              />
            ) : (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            )}
          </>
        )}
      </CreateEditTemplateDialogBase>

      <ConfirmationDialog
        options={{ show: confirmCloseDialogOpen }}
        actions={{
          onCancel: () => setConfirmCloseDialogOpen(false),
          onConfirm: () => onClose?.(),
        }}
        entities={{
          confirmButtonText: t('buttons.yesDiscard'),
          title: t('templateLibrary.importTemplateDialog.confirmClose.title'),
          content: t('templateLibrary.importTemplateDialog.confirmClose.description'),
        }}
      />
    </>
  );
};

export default CreateTemplateDialog;

type CreateTemplateDialogProps = {
  open: boolean;
  templateType: TemplateType;
  onClose: () => void;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;

  temporaryLocation?: boolean;
  getDefaultValues?: () => Promise<Partial<AnyTemplate>>;
};
