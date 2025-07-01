import { Button, DialogActions, DialogContent, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, CalloutVisibility, TemplateType } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Identifiable } from '@/core/utils/Identifiable';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalloutCreationTypeWithPreviewImages,
  useCalloutCreationWithPreviewImages,
} from '../../calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { ClassificationTagsetModel } from '../../calloutsSet/Classification/ClassificationTagset.model';
import CalloutForm from '../CalloutForm/CalloutForm';
import { CalloutFormSubmittedValues } from '../CalloutForm/CalloutFormModel';
import useEnsurePresence from '@/core/utils/ensurePresence';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  mapProfileModelToCreateProfileInput,
  mapProfileTagsToCreateTags,
} from '@/domain/common/profile/ProfileModelUtils';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import scrollToTop from '@/core/ui/utils/scrollToTop';
import Gutters from '@/core/ui/grid/Gutters';
import { mapCalloutSettingsFormToCalloutSettingsModel } from '../models/mappings';

export interface CalloutRestrictions {
  /**
   * Store media in a temporary location (required when the Callout doesn't exist yet)
   */
  temporaryLocation?: boolean;
  /**
   * Disables upload of images, videos and other rich media in the Markdown editors.
   */
  disableRichMedia?: boolean;
  disableComments?: boolean;
  /**
   * Disables whiteboard callouts, both in the framing and in the responses. This is here because VCs still don't support whiteboards.
   */
  disableWhiteboards?: boolean;
  /**
   * Makes the Structured Responses Field read-only
   */
  readOnlyAllowedTypes?: boolean;
}

export interface CreateCalloutDialogProps {
  open?: boolean;
  onClose?: () => void;

  // Where to save the callout:
  calloutsSetId: string | undefined;
  calloutClassification?: ClassificationTagsetModel[] | undefined;

  calloutRestrictions?: CalloutRestrictions;
}

const CreateCalloutDialog = ({
  open = false,
  onClose,
  calloutsSetId,
  calloutClassification,
  calloutRestrictions,
}: CreateCalloutDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();

  const { handleCreateCallout } = useCalloutCreationWithPreviewImages({ calloutsSetId });

  const [importCalloutTemplateDialogOpen, setImportCalloutDialogOpen] = useState(false);

  const [isValid, setIsValid] = useState(false);
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

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

    setImportCalloutDialogOpen(false);
  };

  const [calloutFormData, setCalloutFormData] = useState<CalloutFormSubmittedValues>();

  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const handleCloseButtonClick = () => {
    if (calloutFormData) {
      setConfirmCloseDialogOpen(true);
    } else {
      onClose?.();
    }
  };
  const handleClose = () => {
    setCalloutFormData(undefined);
    setConfirmCloseDialogOpen(false);
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
          formData.settings.contribution.allowedTypes === CalloutContributionType.Post
            ? formData.contributionDefaults.postDescription
            : undefined,
        links:
          formData.settings.contribution.allowedTypes === CalloutContributionType.Link
            ? formData.contributionDefaults.links
            : undefined,
      };

      const createCalloutInput: CalloutCreationTypeWithPreviewImages = {
        ...formData,
        framing,
        settings,
        classification,
        sendNotification,
        contributionDefaults,
      };

      await handleCreateCallout(createCalloutInput);
      handleClose();
      scrollToTop();
    }
  );

  return (
    <>
      <DialogWithGrid open={open} onClose={handleCloseButtonClick} fullWidth>
        <DialogHeader
          title={t('callout.create.dialogTitle')}
          onClose={handleCloseButtonClick}
          actions={
            <Button
              variant="outlined"
              onClick={() => setImportCalloutDialogOpen(true)}
              startIcon={<TipsAndUpdatesOutlinedIcon />}
            >
              {t('buttons.find-template')}
            </Button>
          }
        />
        <DialogContent>
          <CalloutForm
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
        </DialogActions>
      </DialogWithGrid>
      <ImportTemplatesDialog
        templateType={TemplateType.Callout}
        actionButton={
          <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
            {t('buttons.use')}
          </Button>
        }
        open={importCalloutTemplateDialogOpen}
        onSelectTemplate={handleSelectTemplate}
        onClose={() => setImportCalloutDialogOpen(false)}
        enablePlatformTemplates
      />
      <ConfirmationDialog
        entities={{
          titleId: 'components.callout-creation.closeDialog.title',
          contentId: 'components.callout-creation.closeDialog.text',
          confirmButtonTextId: 'buttons.yes-close',
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
