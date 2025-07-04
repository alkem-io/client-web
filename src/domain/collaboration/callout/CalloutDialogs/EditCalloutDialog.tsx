import { Button, DialogActions, DialogContent } from '@mui/material';
import { useCalloutContentQuery, useUpdateCalloutContentMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutContributionType,
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
} from '../models/mappings';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import { useUploadWhiteboardVisuals } from '../../whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';

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
    return {
      ...calloutData,
      id: undefined,
      framing: {
        ...calloutData.framing,
        id: undefined,
        profile: {
          ...calloutData.framing.profile,
          description: calloutData.framing.profile.description ?? '',
          tagsets: calloutData.framing.profile.tagsets ?? [EmptyTagset],
          references: calloutData.framing.profile.references ?? [],
        },
        whiteboard: {
          ...calloutData.framing.whiteboard,
          id: undefined,
          profile: calloutData.framing.whiteboard?.profile ?? { displayName: '' },
          content: calloutData.framing.whiteboard?.content ?? '',
          previewImages: [],
        },
      },
      settings: mapCalloutSettingsModelToCalloutSettingsFormValues(calloutData.settings),
      contributionDefaults: {
        ...calloutData.contributionDefaults,
        id: undefined,
      },
    };
  }, [data?.lookup.callout, loadingCallout]);

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
  const [handleSaveCallout, savingCallout] = useLoadingState(async () => {
    const formData = ensurePresence(calloutFormData);
    // Map the profile to CreateProfileInput
    const framing = {
      ...formData.framing,
      profile: mapProfileModelToUpdateProfileInput(formData.framing.profile),
      whiteboard: undefined,
      whiteboardContent: formData.framing.whiteboard?.content ? formData.framing.whiteboard.content : undefined,
    };

    // And map the radio button allowed contribution types to an array
    const settings: UpdateCalloutSettingsInput = mapCalloutSettingsFormToCalloutSettingsModel(formData.settings);
    // AllowedTypes is read-only for now, never send it to the server
    delete settings?.contribution?.['allowedTypes'];

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
        formData.settings.contribution.allowedTypes === CalloutContributionType.Post
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
    });
    if (result.data?.updateCallout.framing.whiteboard?.profile.preview?.id) {
      await uploadVisuals(formData.framing.whiteboard?.previewImages, {
        previewVisualId: result.data.updateCallout.framing.whiteboard?.profile.preview.id,
      });
    }

    handleClose();
  });

  return (
    <>
      <DialogWithGrid open={open} onClose={handleCloseButtonClick} fullWidth>
        <DialogHeader title={t('callout.edit.dialogTitle')} onClose={handleCloseButtonClick} />
        <DialogContent>
          {loadingCallout ? (
            <Loading />
          ) : (
            <StorageConfigContextProvider locationType="callout" calloutId={calloutId}>
              <CalloutForm
                callout={callout}
                onChange={setCalloutFormData}
                onStatusChanged={handleStatusChange}
                /* Users cannot change the allowedTypes on an already created callout for now */
                calloutRestrictions={{
                  ...calloutRestrictions,
                  readOnlyAllowedTypes: true,
                  temporaryLocation: false,
                  readOnlyContributions: true,
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

export default EditCalloutDialog;
