import { Button, DialogActions, DialogContent, Checkbox, FormControlLabel, Tooltip, Box } from '@mui/material';
import {
  CreateCalloutContributionInput,
  CalloutContributionType,
  CalloutVisibility,
  TemplateType,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import TemplateActionButton from '@/domain/templates/components/Buttons/TemplateActionButton';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutTemplateImport } from './useCalloutTemplateImport';
import {
  CalloutCreationTypeWithPreviewImages,
  useCalloutCreationWithPreviewImages,
} from '../../calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { ClassificationTagsetModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import CalloutForm from '../CalloutForm/CalloutForm';
import { CalloutFormSubmittedValues, isEmptyCalloutForm } from '../CalloutForm/CalloutFormModel';
import useEnsurePresence from '@/core/utils/ensurePresence';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  mapProfileModelToCreateProfileInput,
  mapProfileTagsToCreateTags,
} from '@/domain/common/profile/ProfileModelUtils';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import Gutters from '@/core/ui/grid/Gutters';
import { CalloutRestrictions } from '../CalloutRestrictionsTypes';
import { mapCalloutSettingsFormToCalloutSettingsModel } from '../models/mappings';
import { useScreenSize } from '@/core/ui/grid/constants';

export interface CreateCalloutDialogProps {
  open?: boolean;
  onClose?: () => void;

  // Where to save the callout:
  calloutsSetId?: string;
  calloutClassification?: ClassificationTagsetModel[];

  // Default template to pre-load (from innovation flow state):
  defaultTemplateId?: string | null;

  calloutRestrictions?: CalloutRestrictions;
}

const CreateCalloutDialog = ({
  open = false,
  onClose,
  calloutsSetId,
  calloutClassification,
  defaultTemplateId,
  calloutRestrictions,
}: CreateCalloutDialogProps) => {
  const { t } = useTranslation();
  const { isSmallScreen: isMobile } = useScreenSize();

  const ensurePresence = useEnsurePresence();

  const { handleCreateCallout } = useCalloutCreationWithPreviewImages({ calloutsSetId });

  const [isValid, setIsValid] = useState(false);
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const {
    templateSelected,
    importDialogOpen,
    confirmDialogOpen,
    setImportDialogOpen,
    setConfirmDialogOpen,
    handleSelectTemplate,
    handleImportClick,
    clearTemplate,
    closeDialogs,
  } = useCalloutTemplateImport({ calloutRestrictions, defaultTemplateId, dialogOpen: open });

  const [calloutFormData, setCalloutFormData] = useState<CalloutFormSubmittedValues>();

  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const handleCloseButtonClick = () => {
    if (isEmptyCalloutForm(calloutFormData)) {
      onClose?.();
    } else {
      setConfirmCloseDialogOpen(true);
    }
  };
  const handleClose = () => {
    clearTemplate();
    setCalloutFormData(undefined);
    setConfirmCloseDialogOpen(false);
    closeDialogs();
    onClose?.();
  };

  const [handlePublishCallout, publishingCallout] = useLoadingState(
    async (visibility: CalloutVisibility = CalloutVisibility.Published) => {
      const formData = ensurePresence(calloutFormData);
      // Map the profile to CreateProfileInput
      const framing = {
        ...formData.framing,
        profile: mapProfileModelToCreateProfileInput(formData.framing.profile),
        tags: mapProfileTagsToCreateTags(formData.framing.profile),
        // Map media gallery items to CreateMediaGalleryInput
        mediaGallery: formData.framing.mediaGallery
          ? {
              visuals: formData.framing.mediaGallery.visuals.map(item => ({
                aspectRatio: 1.5,
                maxHeight: 1000,
                maxWidth: 1000,
                minHeight: 100,
                minWidth: 100,
                name: VisualType.Card,
                uri: item.uri,
                alternativeText: item.name || '',
              })),
            }
          : undefined,
      };

      // And map the radio button allowed contribution types to an array
      const settings = mapCalloutSettingsFormToCalloutSettingsModel(formData.settings);
      settings.visibility = visibility;
      // If the calloutClassification is provided, map it to the expected format
      const classification = calloutClassification ? { tagsets: calloutClassification } : undefined;

      // Clean up unneeded contributionDefaults
      const contributionDefaults = {
        ...formData.contributionDefaults,
        defaultDisplayName: formData.contributionDefaults.defaultDisplayName
          ? formData.contributionDefaults.defaultDisplayName
          : undefined, // Only include if it's set, if it's an empty string, we don't want to send it
        whiteboardContent:
          formData.settings.contribution.allowedTypes === CalloutContributionType.Whiteboard
            ? formData.contributionDefaults.whiteboardContent
            : undefined,
        postDescription:
          formData.settings.contribution.allowedTypes === CalloutContributionType.Post ||
          formData.settings.contribution.allowedTypes === CalloutContributionType.Memo
            ? formData.contributionDefaults.postDescription
            : undefined,
      };

      let contributions: CreateCalloutContributionInput[] = [];
      formData.contributions?.links?.forEach(link => {
        contributions.push({
          type: CalloutContributionType.Link,
          link: {
            uri: link.uri,
            profile: {
              displayName: link.name,
              description: link.description,
            },
          },
        });
      });

      const createCalloutInput: CalloutCreationTypeWithPreviewImages = {
        ...formData,
        framing,
        settings,
        classification,
        contributionDefaults,
        contributions,
        sendNotification,
      };

      await handleCreateCallout(createCalloutInput);
      handleClose();
      setTimeout(scrollToTop, 100);
    }
  );

  return (
    <>
      <DialogWithGrid
        open={open}
        onClose={handleCloseButtonClick}
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="create-callout-dialog"
      >
        <DialogHeader
          id="create-callout-dialog"
          title={t('callout.create.dialogTitle')}
          onClose={handleCloseButtonClick}
          actions={
            <Button
              variant="outlined"
              onClick={() => handleImportClick(calloutFormData)}
              startIcon={<TipsAndUpdatesOutlinedIcon />}
            >
              {t('buttons.find-template')}
            </Button>
          }
        />
        <DialogContent>
          <CalloutForm
            callout={templateSelected}
            onChange={setCalloutFormData}
            onStatusChanged={handleStatusChange}
            calloutRestrictions={{ ...calloutRestrictions, temporaryLocation: true }}
          />
        </DialogContent>
        <DialogActions>
          {isValid && (
            <Gutters disableGap row paddingY={0} flex={1} alignItems="center">
              <Tooltip title={t('callout.create.notification.description')} placement="top">
                <FormControlLabel
                  disabled={publishingCallout}
                  control={
                    <Checkbox
                      checked={sendNotification}
                      onChange={e => setSendNotification(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={t('callout.create.notification.label')}
                />
              </Tooltip>
            </Gutters>
          )}
          <Tooltip title={isValid ? undefined : t('callout.create.disabledSubmitTooltip')}>
            <Box>
              <Button
                variant="text"
                onClick={() => handlePublishCallout(CalloutVisibility.Draft)}
                loading={publishingCallout}
                disabled={!isValid}
              >
                {t('buttons.saveDraft')}
              </Button>
              <Button
                variant="contained"
                onClick={() => handlePublishCallout()}
                loading={publishingCallout}
                disabled={!isValid}
              >
                {t('buttons.post')}
              </Button>
            </Box>
          </Tooltip>
        </DialogActions>
      </DialogWithGrid>
      <ImportTemplatesDialog
        templateType={TemplateType.Callout}
        actionButton={() => <TemplateActionButton />}
        open={importDialogOpen}
        onSelectTemplate={handleSelectTemplate}
        onClose={() => setImportDialogOpen(false)}
        enablePlatformTemplates
      />
      <ConfirmationDialog
        entities={{
          titleId: 'callout.create.importTemplate.confirmOverwrite.title',
          contentId: 'callout.create.importTemplate.confirmOverwrite.content',
          confirmButtonTextId: 'buttons.yesContinue',
        }}
        options={{
          show: confirmDialogOpen,
        }}
        actions={{
          onConfirm: () => {
            setImportDialogOpen(true);
            setConfirmDialogOpen(false);
          },
          onCancel: () => setConfirmDialogOpen(false),
        }}
      />
      <ConfirmationDialog
        entities={{
          titleId: 'components.callout-creation.closeDialog.title',
          contentId: 'components.callout-creation.closeDialog.text',
          confirmButtonTextId: 'buttons.yesClose',
        }}
        options={{
          show: confirmCloseDialogOpen,
        }}
        actions={{
          onConfirm: handleClose,
          onCancel: () => setConfirmCloseDialogOpen(false),
        }}
      />
    </>
  );
};

export default CreateCalloutDialog;
