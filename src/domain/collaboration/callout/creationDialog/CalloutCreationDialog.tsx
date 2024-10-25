import { useCallback, useLayoutEffect, useState } from 'react';

import { Trans, useTranslation } from 'react-i18next';

import { LoadingButton } from '@mui/lab';
import Dialog from '@mui/material/Dialog/Dialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Box, Button, Checkbox, FormControlLabel } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';

import Gutters from '../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../core/ui/actions/Actions';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import CalloutForm, { CalloutFormOutput } from '../CalloutForm';
import CalloutTypeSelect from './CalloutType/CalloutTypeSelect';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import ImportTemplatesDialog from '../../../templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';

import calloutIcons from '../utils/calloutIcons';
import { gutters } from '../../../../core/ui/grid/utils';
import {
  CalloutType,
  CalloutState,
  TemplateType,
  CalloutGroupName,
  CalloutVisibility,
} from '../../../../core/apollo/generated/graphql-schema';
import { Reference } from '../../../common/profile/Profile';
import { findDefaultTagset } from '../../../common/tags/utils';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { JourneyTypeName } from '../../../journey/JourneyTypeName';
import { EmptyWhiteboardString } from '../../../common/whiteboard/EmptyWhiteboard';
import { useTemplateContentLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import { CalloutCreationTypeWithPreviewImages } from './useCalloutCreation/useCalloutCreationWithPreviewImages';
import { WhiteboardFieldSubmittedValuesWithPreviewImages } from './CalloutWhiteboardField/CalloutWhiteboardField';
import { INNOVATION_FLOW_STATES_TAGSET_NAME } from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';

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

export type CalloutCreationDialogProps = {
  open: boolean;
  loading: boolean;
  groupName: CalloutGroupName;
  journeyTypeName: JourneyTypeName;
  onClose: () => void;
  onCreateCallout: (callout: CalloutCreationTypeWithPreviewImages) => Promise<Identifiable | undefined>;

  flowState?: string;
};

const CalloutCreationDialog = ({
  open,
  loading,
  groupName,
  flowState,
  journeyTypeName,
  onClose,
  onCreateCallout,
}: CalloutCreationDialogProps) => {
  const { t } = useTranslation();
  const [callout, setCallout] = useState<CalloutCreationDialogFields>({});
  const [isValid, setIsValid] = useState(false);
  const [selectedCalloutType, setSelectedCalloutType] = useState<CalloutType | undefined>(undefined);
  const [isPublishDialogOpen, setIsConfirmPublishDialogOpen] = useState(false);
  const [isConfirmCloseDialogOpen, setIsConfirmCloseDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [importCalloutTemplateDialogOpen, setImportCalloutDialogOpen] = useState(false);

  useLayoutEffect(() => {
    if (open) {
      setSelectedCalloutType(undefined);
    }
  }, [open]);

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

  const isCalloutDataEntered = (callout: CalloutCreationDialogFields) => {
    return (
      callout.displayName ||
      callout.description ||
      callout.postDescription ||
      callout.references?.length !== 0 ||
      callout.tags?.length !== 0 ||
      callout.whiteboard?.content !== EmptyWhiteboardString ||
      callout.whiteboardContent !== EmptyWhiteboardString
    );
  };

  const openPublishDialog = () => setIsConfirmPublishDialogOpen(true);
  const closePublishDialog = () => setIsConfirmPublishDialogOpen(false);
  const openConfirmCloseDialog = () => {
    if (isCalloutDataEntered(callout)) {
      setIsConfirmCloseDialogOpen(true);
    } else {
      handleClose();
    }
  };
  const closeConfirmCloseDialog = () => setIsConfirmCloseDialogOpen(false);

  const handleSaveCallout = useCallback(
    async (visibility: CalloutVisibility, sendNotification: boolean) => {
      let result: Identifiable | undefined;
      try {
        const newCallout: CalloutCreationTypeWithPreviewImages = {
          framing: {
            profile: {
              displayName: callout.displayName!,
              description: callout.description!,
              referencesData: callout.references!.map(ref => ({
                name: ref.name,
                uri: ref.uri,
                description: ref.description,
              })),
              tagsets: flowState ? [{ name: INNOVATION_FLOW_STATES_TAGSET_NAME, tags: [flowState] }] : [],
            },
            whiteboard: callout.type === CalloutType.Whiteboard && callout.whiteboard ? callout.whiteboard : undefined,
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
          groupName,
          visibility,
          sendNotification: visibility === CalloutVisibility.Published && sendNotification,
        };

        result = await onCreateCallout(newCallout);
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
      } finally {
        setCallout({});
        closePublishDialog();
        return result;
      }
    },
    [callout, onCreateCallout]
  );

  const handleClose = useCallback(() => {
    onClose?.();
    setCallout({});
    closeConfirmCloseDialog();
  }, [onClose]);

  const [fetchTemplateContent] = useTemplateContentLazyQuery();

  const handleSelectTemplate = async ({ id: templateId }: Identifiable) => {
    const { data } = await fetchTemplateContent({
      variables: {
        templateId,
        includeCallout: true,
      },
    });

    const template = data?.lookup.template;
    const templateCallout = template?.callout;

    if (!template || !templateCallout) {
      throw new Error("Couldn't load CalloutTemplate");
    }

    const whiteboard = templateCallout.type === CalloutType.Whiteboard ? templateCallout.framing.whiteboard : undefined;

    const references =
      templateCallout.type === CalloutType.LinkCollection ? undefined : templateCallout.framing.profile.references;

    setCallout({
      displayName: templateCallout.framing.profile.displayName,
      description: templateCallout.framing.profile.description,
      tags: findDefaultTagset(templateCallout.framing.profile.tagsets)?.tags,
      references,
      type: templateCallout.type,
      postDescription: templateCallout.contributionDefaults?.postDescription,
      whiteboardContent: templateCallout.contributionDefaults?.whiteboardContent,
      whiteboard: whiteboard && {
        content: whiteboard.content,
        profileData: {
          displayName: 'Whiteboard',
        },
        previewImages: [],
      },
    });

    setSelectedCalloutType(templateCallout.type);

    setImportCalloutDialogOpen(false);
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
                  <Button
                    size="large"
                    variant="outlined"
                    startIcon={<TipsAndUpdatesOutlinedIcon />}
                    sx={{ textTransform: 'none', justifyContent: 'start' }}
                    onClick={() => setImportCalloutDialogOpen(true)}
                  >
                    {t('components.calloutTypeSelect.callout-templates-library')}
                  </Button>
                }
              />
            </Gutters>
          </DialogContent>

          <ImportTemplatesDialog
            enablePlatformTemplates
            templateType={TemplateType.Callout}
            open={importCalloutTemplateDialogOpen}
            actionButton={
              <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
                {t('buttons.use')}
              </LoadingButton>
            }
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setImportCalloutDialogOpen(false)}
          />
        </>
      )}

      {selectedCalloutType && (
        <>
          <DialogHeader onClose={openConfirmCloseDialog}>
            <Box display="flex" alignItems="center" gap={1}>
              {CalloutIcon && <CalloutIcon />}
              {t('components.callout-creation.titleWithType', {
                type: t(`components.calloutTypeSelect.label.${selectedCalloutType}` as const),
              })}
            </Box>
          </DialogHeader>

          <DialogContent>
            {/* Извикай кокалСториджа, разчети го и го спредни тук */}
            <StorageConfigContextProvider temporaryLocation>
              <CalloutForm
                callout={callout}
                calloutType={selectedCalloutType}
                journeyTypeName={journeyTypeName}
                onChange={handleValueChange}
                onStatusChanged={handleStatusChange}
              />
            </StorageConfigContextProvider>
          </DialogContent>

          <Actions padding={gutters()}>
            <Button onClick={openConfirmCloseDialog}>{t('buttons.cancel')}</Button>

            <FlexSpacer />

            <LoadingButton
              loading={loading}
              variant="outlined"
              disabled={!isValid}
              loadingIndicator={`${t('buttons.save-draft')}...`}
              onClick={() => handleSaveCallout(CalloutVisibility.Draft, sendNotification)}
            >
              {t('buttons.save-draft')}
            </LoadingButton>

            <Button variant="contained" disabled={!isValid} onClick={openPublishDialog}>
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
                    values={{ calloutDisplayName: callout.displayName }}
                    components={{ b: <strong /> }}
                  />
                </Box>

                <FormControlLabel
                  label={t('components.callout-creation.publish-dialog.checkbox-label')}
                  control={
                    <Checkbox checked={sendNotification} onChange={() => setSendNotification(!sendNotification)} />
                  }
                />
              </Gutters>
            </DialogContent>

            <Actions padding={gutters()} justifyContent="end">
              <Button onClick={closePublishDialog}>{t('buttons.cancel')}</Button>

              <LoadingButton
                loading={loading}
                variant="contained"
                disabled={!isValid}
                loadingIndicator={`${t('buttons.publish')}...`}
                onClick={() => handleSaveCallout(CalloutVisibility.Published, sendNotification)}
              >
                {t('buttons.publish')}
              </LoadingButton>
            </Actions>
          </Dialog>

          <Dialog open={isConfirmCloseDialogOpen}>
            <DialogHeader
              onClose={closeConfirmCloseDialog}
              title={t('components.callout-creation.close-dialog.title')}
            />

            <DialogContent>
              {t('components.callout-creation.close-dialog.text', {
                calloutType: t(`components.calloutTypeSelect.label.${selectedCalloutType}` as const),
              })}
            </DialogContent>

            <Actions padding={gutters()} justifyContent="end">
              <Button variant="contained" onClick={closeConfirmCloseDialog}>
                {t('buttons.cancel')}
              </Button>

              <Button onClick={handleClose}>{t('buttons.yes-close')}</Button>
            </Actions>
          </Dialog>
        </>
      )}
    </Dialog>
  );
};

export default CalloutCreationDialog;
