import { Button, DialogActions, DialogContent } from '@mui/material';
import { compact } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutContentQuery, useUpdateCalloutContentMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  CalloutContributionType,
  CalloutFramingType,
  type UpdateCalloutEntityInput,
  type UpdateCalloutSettingsInput,
} from '@/core/apollo/generated/graphql-schema';
import SaveButton from '@/core/ui/actions/SaveButton';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import useEnsurePresence from '@/core/utils/ensurePresence';
import type { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';
import { mapProfileModelToUpdateProfileInput } from '@/domain/common/profile/ProfileModelUtils';
import { EmptyTagset } from '@/domain/common/tagset/TagsetModel';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useUploadMediaGalleryVisuals from '../../mediaGallery/useUploadMediaGalleryVisuals';
import { usePollOptionManagement } from '../../poll/hooks/usePollOptionManagement';
import type { PollFormOptionValue } from '../../poll/models/PollModels';
import useUploadWhiteboardVisuals from '../../whiteboard/WhiteboardVisuals/useUploadWhiteboardVisuals';
import CalloutForm from '../CalloutForm/CalloutForm';
import type { CalloutFormSubmittedValues } from '../CalloutForm/CalloutFormModel';
import {
  mapCalloutSettingsFormToCalloutSettingsModel,
  mapCalloutSettingsModelToCalloutSettingsFormValues,
  mapLinkDataToUpdateLinkInput,
} from '../models/mappings';

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
      // biome-ignore lint/style/noNonNullAssertion: Ensured by skip
      calloutId: calloutId!,
    },
    skip: !calloutId || !open,
  });

  // Map the received Callout content data to the CalloutFormSubmittedValues type
  const callout = (() => {
    const calloutData = data?.lookup.callout;
    if (!calloutData) return undefined;
    const { mediaGallery, ...framingData } = calloutData.framing;
    // Map poll data from server model (PollDetailsModel with full option objects)
    // to form model (PollFormValues with {id, text} options, sorted by sortOrder)
    const pollFormValues = framingData.poll
      ? {
          title: framingData.poll.title,
          options: [...framingData.poll.options]
            .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder)
            .map((o: { id: string; text: string }) => ({ id: o.id, text: o.text })),
          settings: {
            allowContributorsAddOptions: framingData.poll.settings.allowContributorsAddOptions,
            minResponses: framingData.poll.settings.minResponses,
            maxResponses: framingData.poll.settings.maxResponses,
            resultsVisibility: framingData.poll.settings.resultsVisibility,
            resultsDetail: framingData.poll.settings.resultsDetail,
          },
        }
      : undefined;
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
        collaboraDocument: framingData.collaboraDocument
          ? {
              displayName: framingData.collaboraDocument.profile?.displayName ?? '',
              documentType: framingData.collaboraDocument.documentType,
            }
          : undefined,
        poll: pollFormValues,
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
  })();

  // Track original visual IDs to detect deletions
  const originalVisualIds = data?.lookup.callout?.framing.mediaGallery?.visuals?.map(v => v.id) ?? [];

  // Track original sort orders to detect reordering
  const originalSortOrders = Object.fromEntries(
    data?.lookup.callout?.framing.mediaGallery?.visuals?.map(v => [v.id, v.sortOrder ?? 0]) ?? []
  );

  // Track original poll options for diffing on save
  const originalPollOptions = data?.lookup.callout?.framing.poll?.options
    ? [...data.lookup.callout.framing.poll.options]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(o => ({ id: o.id, text: o.text }))
    : undefined;

  const pollId = data?.lookup.callout?.framing.poll?.id;
  const pollStatus = data?.lookup.callout?.framing.poll?.status;

  const [isValid, setIsValid] = useState(false);
  const handleStatusChange = (isValid: boolean) => setIsValid(isValid);

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
  const { addOption, updateOption, removeOption, reorderOptions } = usePollOptionManagement({
    pollId: pollId ?? '',
  });
  const notify = useNotification();

  /**
   * Diff form options against original options and apply mutations:
   * 1. Add new options first (no id) — ensures we never drop below the minimum option count
   * 2. Remove options that were deleted
   * 3. Update options whose text changed
   * 4. Reorder if order changed
   */
  const savePollOptionChanges = async (
    formOptions: PollFormOptionValue[],
    origOptions: { id: string; text: string }[]
  ) => {
    const originalIds = new Set(origOptions.map(o => o.id));
    const formIds = new Set<string>(compact(formOptions.map(o => o.id)));

    // 1. Add new options first (those without an id)
    // Done before removals to avoid temporarily violating the server's minimum-2-options rule
    // Track the returned IDs so we can include them in the reorder call
    const newOptionIds = new Map<number, string>();
    // Seed knownIds with ALL original IDs (including pending-removal ones) so that when we
    // search the addPollOption response for the newly added option we don't accidentally
    // match an option that already existed but hasn't been removed yet (removals happen in step 2).
    const knownIds = new Set(origOptions.map(o => o.id));
    for (let i = 0; i < formOptions.length; i++) {
      if (!formOptions[i].id) {
        const result = await addOption(formOptions[i].text);
        const addedPoll = result.data?.addPollOption;
        if (addedPoll) {
          const addedOption = addedPoll.options.find(o => !knownIds.has(o.id));
          if (addedOption) {
            newOptionIds.set(i, addedOption.id);
            knownIds.add(addedOption.id);
          }
        }
      }
    }

    // 2. Remove deleted options
    for (const orig of origOptions) {
      if (!formIds.has(orig.id)) {
        await removeOption(orig.id);
      }
    }

    // 3. Update options whose text changed
    for (const opt of formOptions) {
      if (opt.id && originalIds.has(opt.id)) {
        const orig = origOptions.find(o => o.id === opt.id);
        if (orig && orig.text !== opt.text) {
          await updateOption(opt.id, opt.text);
        }
      }
    }

    // 4. Reorder if the order changed (including newly-added options)
    const allIdsInNewOrder = formOptions.map((o, i) => o.id ?? newOptionIds.get(i)).filter(Boolean) as string[];
    const existingIdsInOrigOrder = origOptions.filter(o => formIds.has(o.id)).map(o => o.id);
    const orderChanged =
      allIdsInNewOrder.length !== existingIdsInOrigOrder.length ||
      allIdsInNewOrder.some((id, i) => id !== existingIdsInOrigOrder[i]);
    if (orderChanged && allIdsInNewOrder.length > 1) {
      await reorderOptions(allIdsInNewOrder);
    }
  };

  const [handleSaveCallout, savingCallout] = useLoadingState(async () => {
    const formData = ensurePresence(calloutFormData);
    const requiredCalloutId = ensurePresence(calloutId);
    // Map the profile to CreateProfileInput
    const { memo, mediaGallery, poll: _poll, ...framingData } = formData.framing;
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
      poll:
        formData.framing.type === CalloutFramingType.Poll
          ? {
              title: formData.framing.poll?.title ?? '',
            }
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
      ID: requiredCalloutId,
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

    // Handle poll option changes via dedicated mutations
    if (pollId && formData.framing.poll && originalPollOptions) {
      try {
        await savePollOptionChanges(formData.framing.poll.options, originalPollOptions);
      } catch {
        notify(t('poll.error.optionActionFailed'), 'error');
        return; // Don't close the dialog so the user can retry
      }
    }

    handleClose();
  });

  return (
    <>
      <DialogWithGrid
        open={open}
        onClose={handleCloseButtonClick}
        fullWidth={true}
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
                edit={true}
                pollId={pollId}
                pollStatus={pollStatus}
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
                  disablePolls: true,
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
