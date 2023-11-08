import React, { FC, useCallback, useLayoutEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog/Dialog';
import {
  PostTemplateCardFragment,
  CalloutState,
  CalloutType,
  WhiteboardTemplateCardFragment,
  CalloutVisibility,
  CalloutDisplayLocation,
} from '../../../../core/apollo/generated/graphql-schema';
import { CalloutCreationTypeWithPreviewImages } from './useCalloutCreation/useCalloutCreationWithPreviewImages';
import { Box, Button, Checkbox, FormControlLabel } from '@mui/material';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import { LoadingButton } from '@mui/lab';
import calloutIcons from '../utils/calloutIcons';
import CalloutForm, { CalloutFormOutput } from '../CalloutForm';
import { useWhiteboardTemplateContentLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Actions } from '../../../../core/ui/actions/Actions';
import { gutters } from '../../../../core/ui/grid/utils';
import CalloutTypeSelect from './CalloutType/CalloutTypeSelect';
import { Reference } from '../../../common/profile/Profile';
import { Identifiable } from '../../../../core/utils/Identifiable';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import Gutters from '../../../../core/ui/grid/Gutters';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from './CalloutWhiteboardField/CalloutWhiteboardField';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import CalloutTemplatesLibrary, { CalloutTemplateWithValues } from '../CalloutTemplatesLibrary/CalloutTemplatesLibrary';

export type CalloutCreationDialogFields = {
  description?: string;
  displayName?: string;
  tags?: string[];
  references?: Reference[];
  type?: CalloutType;
  state?: CalloutState;
  whiteboard?: WhiteboardFieldSubmittedValuesWithPreviewImages;
  profileId?: string;
  flowState?: string;
  postDescription?: string;
  whiteboardContent?: string;
};

export interface CalloutCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateCallout: (callout: CalloutCreationTypeWithPreviewImages) => Promise<Identifiable | undefined>;
  isCreating: boolean;
  calloutNames: string[];
  templates: { postTemplates: PostTemplateCardFragment[]; whiteboardTemplates: WhiteboardTemplateCardFragment[] };
  displayLocation: CalloutDisplayLocation;
  flowState?: string;
  journeyTypeName: JourneyTypeName;
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

const CalloutCreationDialog: FC<CalloutCreationDialogProps> = ({
  open,
  onClose,
  onCreateCallout,
  isCreating,
  calloutNames,
  templates,
  displayLocation,
  flowState,
  journeyTypeName,
}) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();
  const [callout, setCallout] = useState<CalloutCreationDialogFields>({});
  const [isValid, setIsValid] = useState(false);
  const [selectedCalloutType, setSelectedCalloutType] = useState<CalloutType | undefined>(undefined);
  const [isPublishDialogOpen, setIsConfirmPublishDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);

  useLayoutEffect(() => {
    if (open) {
      setSelectedCalloutType(undefined);
    }
  }, [open]);

  const [fetchWhiteboardTemplateContent] = useWhiteboardTemplateContentLazyQuery({
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

  const handleSaveCallout = useCallback(
    async (visibility: CalloutVisibility, sendNotification: boolean) => {
      let result: Identifiable | undefined;
      try {
        const newCallout: CalloutCreationTypeWithPreviewImages = {
          framing: {
            profile: {
              displayName: callout.displayName!,
              description: callout.description!,
              referencesData: callout.references!,
              tagsets: flowState ? [{ name: INNOVATION_FLOW_STATES_TAGSET_NAME, tags: [flowState] }] : [],
            },
            whiteboard: callout.type === CalloutType.Whiteboard ? callout.whiteboard : undefined,
            whiteboardRt:
              callout.type === CalloutType.WhiteboardRt && callout.whiteboard ? callout.whiteboard : undefined,
            tags: callout.tags ?? [],
          },
          contributionDefaults: {
            postDescription: callout.type === CalloutType.PostCollection ? callout.postDescription : undefined,
            whiteboardContent:
              callout.type === CalloutType.WhiteboardCollection ? callout.whiteboardContent : undefined,
          },
          type: callout.type!,
          contributionPolicy: {
            state: callout.state!,
          },
          displayLocation,
          visibility,
          sendNotification: visibility === CalloutVisibility.Published && sendNotification,
        };

        result = await onCreateCallout(newCallout);
      } catch (ex) {
        console.error(ex); // eslint-disable no-console
      } finally {
        setCallout({});
        closePublishDialog();
        return result;
      }
    },
    [callout, onCreateCallout, templates, spaceNameId, fetchWhiteboardTemplateContent]
  );

  const handleClose = useCallback(() => {
    onClose?.();
    setCallout({});
  }, [onClose]);

  const handleSelectTemplate = (template: CalloutTemplateWithValues) => {
    console.log('select template');
  };

  const CalloutIcon = selectedCalloutType ? calloutIcons[selectedCalloutType] : undefined;

  return (
    <Dialog open={open} maxWidth={selectedCalloutType ? 'md' : undefined} aria-labelledby="callout-creation-title">
      {!selectedCalloutType && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex">{t('components.calloutTypeSelect.title')}</Box>
          </DialogHeader>
          <DialogContent>
            <Gutters>
              <CalloutTypeSelect
                onSelect={handleSelectCalloutType}
                extraButtons={
                  <CalloutTemplatesLibrary onImportTemplate={handleSelectTemplate} />
                  // <Button
                  //   size="large"
                  //   startIcon={<TipsAndUpdatesOutlinedIcon />}
                  //   // onClick={handleClick(calloutType)}
                  //   variant="outlined"
                  //   sx={{ textTransform: 'none', justifyContent: 'start' }}
                  // >
                  //   {t('components.calloutTypeSelect.callout-templates-library' as const)}
                  // </Button>
                }
              />
            </Gutters>
          </DialogContent>
        </>
      )}
      {selectedCalloutType && (
        <>
          <DialogHeader onClose={handleClose}>
            <Box display="flex" alignItems="center" gap={1}>
              {CalloutIcon && <CalloutIcon />}
              {t('components.callout-creation.titleWithType', {
                type: t(`components.calloutTypeSelect.label.${selectedCalloutType}` as const),
              })}
            </Box>
          </DialogHeader>
          <CalloutForm
            calloutType={selectedCalloutType}
            callout={callout}
            calloutNames={calloutNames}
            onChange={handleValueChange}
            onStatusChanged={handleStatusChange}
            journeyTypeName={journeyTypeName}
          />
          <Actions padding={gutters()}>
            <Button onClick={handleClose}>{t('buttons.cancel')}</Button>
            <FlexSpacer />
            <LoadingButton
              loading={isCreating}
              loadingIndicator={`${t('buttons.save-draft')}...`}
              onClick={() => handleSaveCallout(CalloutVisibility.Draft, sendNotification)}
              variant="outlined"
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
              <Gutters>
                <Box>
                  <Trans
                    i18nKey="components.callout-creation.publish-dialog.text"
                    values={{
                      calloutDisplayName: callout.displayName,
                    }}
                    components={{
                      b: <strong />,
                    }}
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox checked={sendNotification} onChange={() => setSendNotification(!sendNotification)} />
                  }
                  label={t('components.callout-creation.publish-dialog.checkbox-label')}
                />
              </Gutters>
            </DialogContent>
            <Actions padding={gutters()} justifyContent="end">
              <Button onClick={closePublishDialog}>{t('buttons.cancel')}</Button>
              <LoadingButton
                loading={isCreating}
                loadingIndicator={`${t('buttons.publish')}...`}
                onClick={() => handleSaveCallout(CalloutVisibility.Published, sendNotification)}
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
