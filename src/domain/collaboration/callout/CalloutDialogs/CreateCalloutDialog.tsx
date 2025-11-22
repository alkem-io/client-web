import { Button, DialogActions, DialogContent, Checkbox, FormControlLabel, Tooltip, Box } from '@mui/material';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  CreateCalloutContributionInput,
  CalloutContributionType,
  CalloutVisibility,
  TemplateType,
} from '@/core/apollo/generated/graphql-schema';
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
import { mapCalloutTemplateToCalloutForm, mapCalloutSettingsFormToCalloutSettingsModel } from '../models/mappings';

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

  const [importCalloutTemplateDialogOpen, setImportCalloutTemplateDialogOpen] = useState(false);
  const [importCalloutTemplateConfirmDialogOpen, setImportCalloutTemplateConfirmDialogOpen] = useState(false);

  const [isValid, setIsValid] = useState(false);
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const [templateSelected, setTemplateSelected] = useState<CalloutFormSubmittedValues | undefined>(undefined);
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
    setTemplateSelected(mapCalloutTemplateToCalloutForm(templateCallout, calloutRestrictions));
    if (!template || !templateCallout) {
      throw new Error("Couldn't load CalloutTemplate");
    }

    setImportCalloutTemplateDialogOpen(false);
  };
  const handleImportTemplateClick = () => {
    if (isEmptyCalloutForm(calloutFormData)) {
      setImportCalloutTemplateDialogOpen(true);
    } else {
      setImportCalloutTemplateConfirmDialogOpen(true);
    }
  };

  const [calloutFormData, setCalloutFormData] = useState<CalloutFormSubmittedValues>();

  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const handleCloseButtonClick = () => {
    if (!isEmptyCalloutForm(calloutFormData)) {
      setConfirmCloseDialogOpen(true);
    } else {
      onClose?.();
    }
  };
  const handleClose = () => {
    setTemplateSelected(undefined);
    setCalloutFormData(undefined);
    setConfirmCloseDialogOpen(false);
    setImportCalloutTemplateDialogOpen(false);
    setImportCalloutTemplateConfirmDialogOpen(false);
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
              visuals: formData.framing.mediaGallery.items.map(item => ({
                aspectRatio: 1.5,
                maxHeight: 1000,
                maxWidth: 1000,
                minHeight: 100,
                minWidth: 100,
                name: 'CARD',
                uri: item.url,
                alternativeText: item.title || '',
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
      <DialogWithGrid open={open} onClose={handleCloseButtonClick} fullWidth aria-labelledby="create-callout-dialog">
        <DialogHeader
          id="create-callout-dialog"
          title={t('callout.create.dialogTitle')}
          onClose={handleCloseButtonClick}
          actions={
            <Button variant="outlined" onClick={handleImportTemplateClick} startIcon={<TipsAndUpdatesOutlinedIcon />}>
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
        actionButton={() => (
          <Button startIcon={<SystemUpdateAltIcon />} variant="contained">
            {t('buttons.use')}
          </Button>
        )}
        open={importCalloutTemplateDialogOpen}
        onSelectTemplate={handleSelectTemplate}
        onClose={() => setImportCalloutTemplateDialogOpen(false)}
        enablePlatformTemplates
      />
      <ConfirmationDialog
        entities={{
          titleId: 'callout.create.importTemplate.confirmOverwrite.title',
          contentId: 'callout.create.importTemplate.confirmOverwrite.content',
          confirmButtonTextId: 'buttons.yesContinue',
        }}
        options={{
          show: importCalloutTemplateConfirmDialogOpen,
        }}
        actions={{
          onConfirm: () => {
            setImportCalloutTemplateDialogOpen(true);
            setImportCalloutTemplateConfirmDialogOpen(false);
          },
          onCancel: () => setImportCalloutTemplateConfirmDialogOpen(false),
        }}
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
