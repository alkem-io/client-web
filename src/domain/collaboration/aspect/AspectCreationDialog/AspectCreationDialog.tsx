import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import AspectForm, { AspectFormOutput } from '../AspectForm/AspectForm';
import { CreateAspectOnCalloutInput } from '../../../../models/graphql-schema';
import { useCalloutCardTemplate } from '../../callout/hooks/useCalloutCardTemplate';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';

export type AspectCreationType = Partial<CreateAspectOnCalloutInput>;
export type AspectCreationOutput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

export type AspectCreationDialogProps = {
  open: boolean;
  aspectNames: string[];
  onClose: () => void;
  onCreate: (aspect: AspectCreationOutput) => Promise<{ nameID: string } | undefined>;
  calloutDisplayName: string;
  calloutId: string;
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
  hubNameId,
  challengeNameId,
  opportunityNameId,
  calloutId,
}) => {
  const { t } = useTranslation();
  const [aspect, setAspect] = useState<AspectCreationType>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const { cardTemplate } = useCalloutCardTemplate({
    calloutNameId: calloutId,
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  const handleClose = () => {
    setAspect({});
    onClose();
  };

  const handleCreate = async () => {
    await onCreate({
      displayName: aspect?.displayName ?? '',
      description: aspect?.description ?? '',
      type: cardTemplate?.type ?? '',
      tags: aspect?.tags ?? [],
      visualUri: cardTemplate?.info?.visualUri,
    });
    handleClose();
  };

  const handleFormChange = (newAspect: AspectFormOutput) => setAspect({ ...aspect, ...newAspect });
  const handleFormStatusChange = (isValid: boolean) => setIsFormValid(isValid);
  const tags = aspect?.tags ?? cardTemplate?.info?.tags;

  const renderButtons = () => {
    return (
      <>
        <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!isFormValid}>
          {t('buttons.create')}
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="aspect-creation-title">
      <DialogTitle id="aspect-creation-title" onClose={handleClose}>
        <Box display="flex" alignItems="center">
          <CampaignOutlinedIcon sx={{ marginRight: 1 }} />
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
