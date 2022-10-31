import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import AspectForm, { AspectFormOutput } from '../AspectForm/AspectForm';
import { CreateAspectOnCalloutInput } from '../../../../models/graphql-schema';
import { AspectVisualsStepProps } from './steps/AspectVisualsStep/AspectVisualsStep';
import {
  useHubCalloutCardTemplateQuery,
  useChallengeCalloutCardTemplateQuery,
  useOpportunityCalloutCardTemplateQuery,
} from '../../../../hooks/generated/graphql';

export type AspectCreationType = Partial<CreateAspectOnCalloutInput>;
export type AspectCreationOutput = Omit<CreateAspectOnCalloutInput, 'calloutID'>;

export interface AspectCreationDialogProps extends Omit<AspectVisualsStepProps, 'aspectNameId'> {
  open: boolean;
  aspectNames: string[];
  onClose: () => void;
  onCreate: (aspect: AspectCreationOutput) => Promise<{ nameID: string } | undefined>;
  calloutDisplayName: string;
  calloutId: string;
}

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
  hubNameId = '',
  challengeNameId = '',
  opportunityNameId = '',
  calloutId,
}) => {
  const { t } = useTranslation();
  const [aspect, setAspect] = useState<AspectCreationType>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const { data: hubCalloutsCardTemplates } = useHubCalloutCardTemplateQuery({
    variables: { hubId: hubNameId, calloutId: calloutId },
    skip: !hubNameId || !!(challengeNameId || opportunityNameId),
  });
  const { data: challengeCalloutsCardTemplates } = useChallengeCalloutCardTemplateQuery({
    variables: { hubId: hubNameId, calloutId: calloutId, challengeNameId },
    skip: !challengeNameId || !hubNameId,
  });
  const { data: opportunityCalloutsCardTemplates } = useOpportunityCalloutCardTemplateQuery({
    variables: { hubId: hubNameId, calloutId: calloutId, opportunityNameId },
    skip: !opportunityNameId || !hubNameId,
  });

  let cardTemplate: CardCreationCardTemplate | undefined;
  if (hubCalloutsCardTemplates && hubCalloutsCardTemplates.hub.collaboration?.callouts) {
    const parentCallout = hubCalloutsCardTemplates.hub.collaboration.callouts[0];
    if (parentCallout) {
      cardTemplate = {
        type: parentCallout?.cardTemplate?.type,
        defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
        info: {
          tags: parentCallout?.cardTemplate?.info.tagset?.tags,
          visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
        },
      };
    }
  }
  if (challengeCalloutsCardTemplates && challengeCalloutsCardTemplates.hub.challenge.collaboration?.callouts) {
    const parentCallout = challengeCalloutsCardTemplates.hub.challenge.collaboration.callouts[0];
    if (parentCallout) {
      cardTemplate = {
        type: parentCallout?.cardTemplate?.type,
        defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
        info: {
          tags: parentCallout?.cardTemplate?.info.tagset?.tags,
          visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
        },
      };
    }
  }
  if (opportunityCalloutsCardTemplates && opportunityCalloutsCardTemplates.hub.opportunity.collaboration?.callouts) {
    const parentCallout = opportunityCalloutsCardTemplates.hub.opportunity.collaboration.callouts[0];
    if (parentCallout) {
      cardTemplate = {
        type: parentCallout?.cardTemplate?.type,
        defaultDescription: parentCallout?.cardTemplate?.defaultDescription,
        info: {
          tags: parentCallout?.cardTemplate?.info.tagset?.tags,
          visualUri: parentCallout?.cardTemplate?.info.visual?.uri,
        },
      };
    }
  }

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
