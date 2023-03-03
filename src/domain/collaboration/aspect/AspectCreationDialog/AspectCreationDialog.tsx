import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import { CalloutIcon } from '../../callout/icon/CalloutIcon';
import { DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import AspectForm, { AspectFormOutput } from '../AspectForm/AspectForm';
import { CreateAspectOnCalloutInput } from '../../../../core/apollo/generated/graphql-schema';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import { CalloutCardTemplate } from '../../callout/creation-dialog/CalloutCreationDialog';

export type AspectCreationType = Partial<CreateAspectOnCalloutInput>;
export type AspectCreationOutput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

export type AspectCreationDialogProps = {
  open: boolean;
  aspectNames: string[];
  onClose: () => void;
  onCreate: (aspect: AspectCreationOutput) => Promise<{ nameID: string } | undefined>;
  calloutDisplayName: string;
  calloutId: string;
  cardTemplate: CalloutCardTemplate | undefined;
  isCreating: boolean;
} & CoreEntityIdTypes;

export interface CardCreationCardTemplateInfo {
  tags: string[] | undefined;
  visualUri: string | undefined;
}

export interface CardCreationCardTemplate {
  type: string | undefined;
  defaultDescription: string | undefined;
  info: CardCreationCardTemplateInfo;
}

const AspectCreationDialog: FC<AspectCreationDialogProps> = ({
  open,
  aspectNames,
  onClose,
  onCreate,
  calloutDisplayName,
  cardTemplate,
  isCreating,
}) => {
  const { t } = useTranslation();
  const [aspect, setAspect] = useState<AspectCreationType>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const handleClose = () => {
    setAspect({});
    onClose();
  };

  const handleCreate = async () => {
    await onCreate({
      profileData: {
        displayName: aspect?.profileData?.displayName ?? '',
        description: aspect?.profileData?.description ?? '',
      },
      type: cardTemplate?.type ?? '',
      visualUri: cardTemplate?.info?.visual?.uri,
    });
    handleClose();
  };

  const handleFormChange = (newAspect: AspectFormOutput) =>
    setAspect({
      ...aspect,
      profileData: {
        displayName: newAspect.displayName,
        description: newAspect.description,
      },
      ...newAspect,
    });
  const handleFormStatusChange = (isValid: boolean) => setIsFormValid(isValid);
  const tags = cardTemplate?.info?.tags;

  const renderButtons = () => {
    return (
      <>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!isFormValid || isCreating}>
          {t('buttons.create')}
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="aspect-creation-title">
      <DialogTitle id="aspect-creation-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          <CalloutIcon sx={{ marginRight: 1 }} />
          {t('components.aspect-creation.title', { calloutDisplayName: calloutDisplayName })}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box marginBottom={2} marginTop={2}>
          <AspectForm
            aspect={aspect}
            aspectNames={aspectNames}
            onChange={handleFormChange}
            onStatusChanged={handleFormStatusChange}
            descriptionTemplate={cardTemplate?.defaultDescription}
            tags={tags}
          />
        </Box>
      </DialogContent>
      <DialogActions>{renderButtons()}</DialogActions>
    </Dialog>
  );
};

export default AspectCreationDialog;
