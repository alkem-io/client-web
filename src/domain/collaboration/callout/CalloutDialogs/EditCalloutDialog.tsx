import { Button, DialogActions, DialogContent } from '@mui/material';
import { useCalloutContentQuery, useUpdateCalloutContentMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutContributionType,
  CalloutFramingType,
  UpdateCalloutEntityInput,
  UpdateCalloutSettingsInput,
} from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import CalloutForm from '../CalloutForm/CalloutForm';
import { CalloutFormSubmittedValues } from '../CalloutForm/CalloutFormModel';
import useEnsurePresence from '@/core/utils/ensurePresence';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { mapProfileModelToUpdateProfileInput } from '@/domain/common/profile/ProfileModelUtils';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { EmptyTagset } from '@/domain/common/tagset/TagsetModel';
import Loading from '@/core/ui/loading/Loading';
import SaveButton from '@/core/ui/actions/SaveButton';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import {
  mapCalloutSettingsFormToCalloutSettingsModel,
  mapCalloutSettingsModelToCalloutSettingsFormValues,
  mapLinkDataToUpdateLinkInput,
} from '../models/mappings';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import useUploadWhiteboardVisuals from '../../whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import useUploadMediaGalleryVisuals from '../../mediaGallery/useUploadMediaGalleryVisuals';
import { useNotification } from '@/core/ui/notifications/useNotification';

export interface EditCalloutDialogProps {
  open?: boolean;
  onClose?: () => void;
  calloutId: string | undefined;
  calloutRestrictions?: CalloutRestrictions;
}

const EditCalloutDialog = ({ open = false, onClose, calloutId, calloutRestrictions }: EditCalloutDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();

  const { data, loading: loadingCallout } = useCalloutContentQuery({
    variables: {
      calloutId: calloutId!,
    },
    skip: !calloutId || !open,
  });

  // Map the received Callout content data to the CalloutFormSubmittedValues type
  const callout = useMemo<CalloutFormSubmittedValues | undefined>(() => {
    const calloutData = data?.lookup.callout;
    if (!calloutData) return undefined;
    const { mediaGallery, ...framingData } = calloutData.framing;
    return {
      ...calloutData,
      id: undefined,
      framing: {
        ...framingData,
        id: undefined,
        profile: {
          ...framingData.profile,
          description: framingData.profile.description ?? '',
          tagsets: framingData.profile.tagsets ?? [EmptyTagset],
          references: framingData.profile.references ?? [],
        },
        whiteboard: {
          ...framingData.whiteboard,
          id: undefined,
          profile: framingData.whiteboard?.profile ?? { displayName: '' },
          content: framingData.whiteboard?.content ?? '',
          previewImages: [],
          previewSettings: framingData.whiteboard?.previewSettings,
        },
        memo: {
          ...framingData.memo,
          id: undefined,
          profile: framingData.memo?.profile ?? { displayName: '' },
          markdown: framingData.memo?.markdown ?? '',
          previewImages: [],
        },
        link: framingData.link,
        mediaGallery: {
          ...mediaGallery,
          visuals:
            mediaGallery?.visuals?.map(v => ({
              ...v,
              previewUrl: '',
              file: undefined,
            })) || [],
        },
      },
      settings: mapCalloutSettingsModelToCalloutSettingsFormValues(calloutData.settings),
      contributionDefaults: {
        ...calloutData.contributionDefaults,
        id: undefined,
      },
    };
  }, [data?.lookup.callout, loadingCallout]);

  // Track original visual IDs to detect deletions
  const originalVisualIds = useMemo(
    () => data?.lookup.callout?.framing.mediaGallery?.visuals?.map(v => v.id) ?? [],
    [data?.lookup.callout?.framing.mediaGallery?.visuals]
  );

  // Track original sort orders to detect reordering
  const originalSortOrders = useMemo(
    () =>
      Object.fromEntries(data?.lookup.callout?.framing.mediaGallery?.visuals?.map(v => [v.id, v.sortOrder ?? 0]) ?? []),
    [data?.lookup.callout?.framing.mediaGallery?.visuals]
  );

  const [isValid, setIsValid] = useState(false);
  const handleStatusChange = useCallback((isValid: boolean) => setIsValid(isValid), []);

  const [calloutFormData, setCalloutFormData] = useState<CalloutFormSubmittedValues>();

  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
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

  const [updateCalloutContent] = useUpdateCalloutContentMutation();
  const { uploadVisuals } = useUploadWhiteboardVisuals();
  const { uploadMediaGalleryVisuals } = useUploadMediaGalleryVisuals();
  const notify = useNotification();
  const [handleSaveCallout, savingCallout] = useLoadingState(async () => {
    const formData = ensurePresence(calloutFormData);
    // Map the profile to CreateProfileInput
    const { memo, mediaGallery, ...framingData } = formData.framing;
    const framing = {
      ...framingData,
      profile: mapProfileModelToUpdateProfileInput(formData.framing.profile),
      whiteboard: undefined,
      whiteboardContent:
        formData.framing.type === CalloutFramingType.Whiteboard && formData.framing.whiteboard?.content
          ? formData.framing.whiteboard.content
          : undefined,
      link:
        formData.framing.type === CalloutFramingType.Link
          ? mapLinkDataToUpdateLinkInput(formData.framing.link)
          : undefined,
      // mediaGallery is updated separately image by image
    };

    // And map the radio button allowed contribution types to an array
    const settingsTemp: UpdateCalloutSettingsInput = mapCalloutSettingsFormToCalloutSettingsModel(formData.settings);
    // AllowedTypes is read-only for now, never send it to the server
    // TypeScript doesn't know about allowedTypes, but it exists at runtime
    const contributionTemp = settingsTemp?.contribution as Record<string, unknown> | undefined;
    const { allowedTypes: _, ...contribution } = contributionTemp ?? {};
    const settings: UpdateCalloutSettingsInput = {
      ...settingsTemp,
      contribution: Object.keys(contribution).length > 0 ? contribution : undefined,
    };

    // Clean up unneeded contributionDefaults
    // TODO: extract as used in CreateCalloutDialog
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

    const updateCalloutContentInput: UpdateCalloutEntityInput = {
      ID: calloutId!,
      ...formData,
      framing,
      settings,
      contributionDefaults,
    };

    const result = await updateCalloutContent({
      variables: {
        calloutData: updateCalloutContentInput,
      },
      refetchQueries: ['CalloutsSetTags'],
    });
    // Media gallery uploads use allSettled internally — individual failures are handled
    // by the global Apollo error handler which shows notifications with proper error codes.
    // The dialog always closes so successfully uploaded images aren't duplicated on retry.
    if (result.data?.updateCallout.framing.mediaGallery?.id && formData.framing.mediaGallery?.visuals) {
      try {
        await uploadMediaGalleryVisuals({
          mediaGalleryId: result.data.updateCallout.framing.mediaGallery.id,
          visuals: formData.framing.mediaGallery.visuals,
          existingVisualIds: originalVisualIds,
          originalSortOrders,
        });
      } catch {
        notify(t('components.visual-upload.entityCreatedErrorUploading', { entity: t('common.callout') }), 'error');
      }
    }
    if (result.data?.updateCallout.framing.whiteboard?.profile.preview?.id) {
      await uploadVisuals(formData.framing.whiteboard?.previewImages, {
        previewVisualId: result.data.updateCallout.framing.whiteboard?.profile.preview.id,
      });
    }

    handleClose();
  });

  return (
    <>
      <DialogWithGrid
        open={open}
        onClose={handleCloseButtonClick}
        fullWidth
        aria-labelledby="edit-callout-dialog-title"
      >
        <DialogHeader
          title={t('callout.edit.dialogTitle')}
          onClose={handleCloseButtonClick}
          id="edit-callout-dialog-title"
        />
        <DialogContent>
          {loadingCallout ? (
            <Loading />
          ) : (
            <StorageConfigContextProvider locationType="callout" calloutId={calloutId}>
              <CalloutForm
                callout={callout}
                onChange={setCalloutFormData}
                onStatusChanged={handleStatusChange}
                edit
                /* Users cannot change the allowedTypes on an already created callout for now */
                calloutRestrictions={{
                  ...calloutRestrictions,
                  readOnlyAllowedTypes: true,
                  temporaryLocation: false,
                  readOnlyContributions: true,
                  onlyRealTimeWhiteboardFraming: true,
                  // disable the change of framing type for now, but allow editing content
                  disableMemos: true,
                  disableWhiteboards: true,
                  disableLinks: true,
                  disableMediaGallery: true,
                }}
              />
            </StorageConfigContextProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="text" disabled={savingCallout}>
            {t('buttons.cancel')}
          </Button>
          <SaveButton variant="contained" onClick={handleSaveCallout} loading={savingCallout} disabled={!isValid}>
            {t('buttons.save')}
          </SaveButton>
        </DialogActions>
      </DialogWithGrid>
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

export default EditCalloutDialog;
