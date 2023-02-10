import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import {
  AspectTemplateFragment,
  CalloutState,
  CalloutType,
  CanvasTemplateFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutCreationType } from './useCalloutCreation/useCalloutCreation';
import { Box, Button } from '@mui/material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import { LoadingButton } from '@mui/lab';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CalloutForm, { CalloutFormOutput, CanvasTemplateData } from '../CalloutForm';
import { createCardTemplateFromTemplateSet } from '../utils/createCardTemplateFromTemplateSet';
import {
  useHubTemplatesCanvasTemplateWithValueLazyQuery,
  useInnovationPackFullCanvasTemplateWithValueLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { createCanvasTemplateForCalloutCreation } from '../utils/createCanvasTemplateForCalloutCreation';

export type CalloutCreationDialogFields = {
  description?: string;
  displayName?: string;
  templateId?: string;
  type?: CalloutType;
  state?: CalloutState;
  cardTemplateType?: string;
  canvasTemplateData?: CanvasTemplateData;
};

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveAsDraft: (callout: CalloutCreationType) => Promise<void>;
  isCreating: boolean;
  calloutNames: string[];
  templates: { cardTemplates: AspectTemplateFragment[]; canvasTemplates: CanvasTemplateFragment[] };
}

export interface TemplateInfo {
  description: string;
  title: string;
  tags?: string[];
  visual?: {
    uri: string;
  };
}

export interface CalloutCardTemplate {
  defaultDescription: string;
  type: string;
  info: TemplateInfo;
}

export interface CalloutCanvasTemplate {
  id?: string;
  value: string;
  info: TemplateInfo;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({
  open,
  onClose,
  onSaveAsDraft,
  isCreating,
  calloutNames,
  templates,
}) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();
  const [callout, setCallout] = useState<CalloutCreationDialogFields>({});
  const [isValid, setIsValid] = useState(false);

  const [fetchCanvasValueFromHub] = useHubTemplatesCanvasTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [fetchCanvasValueFromLibrary] = useInnovationPackFullCanvasTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const handleValueChange = useCallback(
    (calloutValues: CalloutFormOutput) => {
      setCallout({ ...callout, ...calloutValues });
    },
    [callout]
  );
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const handleSaveAsDraft = useCallback(async () => {
    const calloutCardTemplate = createCardTemplateFromTemplateSet(callout, templates.cardTemplates);

    const getCanvasValueFromHub = async () => {
      if (!callout.canvasTemplateData?.id) return undefined;

      const result = await fetchCanvasValueFromHub({
        variables: { hubId: hubNameId!, canvasTemplateId: callout.canvasTemplateData?.id },
      });

      return result.data?.hub.templates;
    };

    const getCanvasValueFromLibrary = async () => {
      if (!callout.canvasTemplateData?.id) return undefined;

      const result = await fetchCanvasValueFromLibrary({
        variables: {
          innovationPackId: callout.canvasTemplateData?.innovationPackId!,
          canvasTemplateId: callout.canvasTemplateData?.id!,
        },
      });

      return result.data?.platform.library.innovationPack?.templates;
    };

    const queryResult =
      callout.canvasTemplateData?.origin === 'Hub' ? await getCanvasValueFromHub() : await getCanvasValueFromLibrary();

    const calloutCanvasTemplate = createCanvasTemplateForCalloutCreation(queryResult?.canvasTemplate);
    const newCallout: CalloutCreationType = {
      displayName: callout.displayName!,
      description: callout.description!,
      type: callout.type!,
      state: callout.state!,
      cardTemplate: calloutCardTemplate,
      canvasTemplate: calloutCanvasTemplate,
    };

    const result = await onSaveAsDraft(newCallout);

    setCallout({});

    return result;
  }, [callout, onSaveAsDraft, templates, hubNameId, fetchCanvasValueFromHub, fetchCanvasValueFromLibrary]);

  const handleClose = useCallback(() => {
    onClose?.();
    setCallout({});
  }, [onClose]);

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-creation-title">
      <DialogTitle id="callout-creation-title" onClose={handleClose}>
        <Box display="flex">
          <CampaignOutlinedIcon sx={{ marginRight: 1 }} />
          {t('components.callout-creation.title')}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box paddingY={theme => theme.spacing(2)}>
          <CalloutForm
            callout={callout}
            calloutNames={calloutNames}
            onChange={handleValueChange}
            onStatusChanged={handleStatusChange}
            templates={templates}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'end' }}>
        {onClose && <Button onClick={onClose}>{t('buttons.cancel')}</Button>}
        <LoadingButton
          loading={isCreating}
          loadingIndicator={`${t('buttons.save-draft')}...`}
          onClick={handleSaveAsDraft}
          variant="contained"
          disabled={!isValid}
        >
          {t('buttons.save-draft')}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default CalloutCreationDialog;
