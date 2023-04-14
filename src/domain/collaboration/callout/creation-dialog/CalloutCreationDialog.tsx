import React, { FC, useCallback, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import {
  PostTemplateFragment,
  CalloutState,
  CalloutType,
  WhiteboardTemplateFragment,
  CalloutVisibility,
  Callout,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutCreationType } from './useCalloutCreation/useCalloutCreation';
import { Box, Button, Checkbox, FormControlLabel } from '@mui/material';
import { DialogContent } from '../../../../common/components/core/dialog';
import { LoadingButton } from '@mui/lab';
import { CalloutIcon } from '../icon/CalloutIcon';
import CalloutForm, { CalloutFormOutput, WhiteboardTemplateData } from '../CalloutForm';
import {
  useHubTemplatesWhiteboardTemplateWithValueLazyQuery,
  useInnovationPackFullWhiteboardTemplateWithValueLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { createWhiteboardTemplateForCalloutCreation } from '../utils/createWhiteboardTemplateForCalloutCreation';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutTypeSelect from './CalloutType/CalloutTypeSelect';
import { Reference } from '../../../common/profile/Profile';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import { createCalloutPostTemplate } from '../utils/createCalloutPostTemplate';
import { Identifiable } from '../../../shared/types/Identifiable';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';

export type CalloutCreationDialogFields = {
  description?: string;
  displayName?: string;
  tags?: string[];
  references?: Reference[];
  type?: CalloutType;
  state?: CalloutState;
  postTemplateType?: string;
  postTemplateDefaultDescription?: string;
  whiteboardTemplateData?: WhiteboardTemplateData;
  profileId?: string;
};

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveAsDraft: (callout: CalloutCreationType) => Promise<Identifiable | undefined>;
  onVisibilityChange: (
    calloutId: Callout['id'],
    visibility: CalloutVisibility,
    sendNotification: boolean
  ) => Promise<void>;
  isCreating: boolean;
  calloutNames: string[];
  templates: { postTemplates: PostTemplateFragment[]; whiteboardTemplates: WhiteboardTemplateFragment[] };
}

export interface TemplateProfile {
  description?: string;
  displayName: string;
  tagset?: {
    tags: string[];
  };
  visual?: {
    uri: string;
  };
}

export interface CalloutPostTemplate {
  defaultDescription: string;
  type: string;
  profile: TemplateProfile;
  tags?: string[];
}

export interface CalloutWhiteboardTemplate {
  id?: string;
  value: string;
  profile: TemplateProfile;
}

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({
  open,
  onClose,
  onSaveAsDraft,
  onVisibilityChange,
  isCreating,
  calloutNames,
  templates,
}) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();
  const [callout, setCallout] = useState<CalloutCreationDialogFields>({});
  const [isValid, setIsValid] = useState(false);
  const [selectedCalloutType, setSelectedCalloutType] = useState<CalloutType | undefined>(undefined);
  const [isPublishDialogOpen, setIsConfirmPublishDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);

  useLayoutEffect(() => {
    if (!open) return;
    setSelectedCalloutType(undefined);
  }, [open]);

  const [fetchCanvasValueFromHub] = useHubTemplatesWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [fetchCanvasValueFromLibrary] = useInnovationPackFullWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const handleValueChange = useCallback(
    (calloutValues: CalloutFormOutput) => {
      setCallout({ ...callout, ...calloutValues });
    },
    [callout]
  );
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const handleSelectCalloutType = (value: CalloutType | undefined) => {
    setSelectedCalloutType(value);
  };

  const openPublishDialog = () => setIsConfirmPublishDialogOpen(true);
  const closePublishDialog = () => setIsConfirmPublishDialogOpen(false);

  const handlePublish = async () => {
    const createdCallout = await handleSaveAsDraftCallout();
    if (createdCallout) {
      await onVisibilityChange(createdCallout.id, CalloutVisibility.Published, sendNotification);
    }
    closePublishDialog();
  };

  const handleSaveAsDraftCallout = useCallback(async () => {
    const calloutPostTemplate = createCalloutPostTemplate(callout);

    const getCanvasValueFromHub = async () => {
      if (!callout.whiteboardTemplateData?.id) return undefined;

      const result = await fetchCanvasValueFromHub({
        variables: { hubId: hubNameId!, whiteboardTemplateId: callout.whiteboardTemplateData?.id },
      });

      return result.data?.hub.templates;
    };

    const getCanvasValueFromLibrary = async () => {
      if (!callout.whiteboardTemplateData?.id || !callout.whiteboardTemplateData?.innovationPackId) return undefined;

      const result = await fetchCanvasValueFromLibrary({
        variables: {
          innovationPackId: callout.whiteboardTemplateData?.innovationPackId,
          whiteboardTemplateId: callout.whiteboardTemplateData?.id,
        },
      });

      return result.data?.platform.library.innovationPack?.templates;
    };

    const queryResult =
      callout.whiteboardTemplateData?.origin === 'Hub'
        ? await getCanvasValueFromHub()
        : await getCanvasValueFromLibrary();

    const calloutWhiteboardTemplate = createWhiteboardTemplateForCalloutCreation(queryResult?.whiteboardTemplate);
    const newCallout: CalloutCreationType = {
      profile: {
        displayName: callout.displayName!,
        description: callout.description!,
        referencesData: callout.references!,
      },
      tags: callout.tags,
      type: callout.type!,
      state: callout.state!,
      postTemplate: calloutPostTemplate,
      whiteboardTemplate: calloutWhiteboardTemplate,
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
      {!selectedCalloutType && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex">{t('components.callout-creation.callout-type-select.title')}</Box>
          </DialogHeader>
          <DialogContent>
            <Box paddingY={theme => theme.spacing(2)}>
              <CalloutTypeSelect value={selectedCalloutType} onSelect={handleSelectCalloutType} />
            </Box>
          </DialogContent>
        </>
      )}
      {selectedCalloutType && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex">
              <CalloutIcon sx={{ marginRight: 1 }} />
              {t('components.callout-creation.title')}
            </Box>
          </DialogHeader>
          <CalloutForm
            calloutType={selectedCalloutType}
            callout={callout}
            calloutNames={calloutNames}
            onChange={handleValueChange}
            onStatusChanged={handleStatusChange}
            templates={templates}
          />
          <Actions padding={gutters()}>
            <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
            <FlexSpacer />
            <LoadingButton
              loading={isCreating}
              loadingIndicator={`${t('buttons.save-draft')}...`}
              onClick={handleSaveAsDraftCallout}
              variant="contained"
              disabled={!isValid}
            >
              {t('buttons.save-draft')}
            </LoadingButton>
            <Button variant="contained" onClick={openPublishDialog} disabled={!isValid}>
              {t('buttons.publish')}
            </Button>
          </Actions>
          <Dialog open={isPublishDialogOpen} maxWidth="xs">
            <DialogHeader onClose={closePublishDialog}>
              <Box display="flex">{t('buttons.publish')}</Box>
            </DialogHeader>
            <DialogContent>
              <Box paddingY={theme => theme.spacing(2)} />
              {t('components.callout-creation.publish-dialog.text', { calloutDisplayName: callout.displayName })}
              <SectionSpacer />
              <FormControlLabel
                control={
                  <Checkbox checked={sendNotification} onChange={() => setSendNotification(!sendNotification)} />
                }
                label={t('components.callout-creation.publish-dialog.checkbox-label')}
              />
            </DialogContent>
            <Actions padding={gutters()} justifyContent="end">
              <Button onClick={closePublishDialog}>{t('buttons.cancel')}</Button>
              <LoadingButton
                loading={isCreating}
                loadingIndicator={`${t('buttons.publish')}...`}
                onClick={handlePublish}
                variant="contained"
                disabled={!isValid}
              >
                {t('buttons.publish')}
              </LoadingButton>
            </Actions>
          </Dialog>
        </>
      )}
    </Dialog>
  );
};

export default CalloutCreationDialog;
