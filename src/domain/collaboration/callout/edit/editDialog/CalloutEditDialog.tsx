import { CalloutType, TagsetType } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import CalloutForm, { CalloutFormInput, CalloutFormOutput } from '@/domain/collaboration/callout/CalloutForm';
import { CalloutLayoutProps } from '@/domain/collaboration/callout/calloutBlock/CalloutLayout';
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SaveButton from '@/core/ui/actions/SaveButton';
import DeleteButton from '@/core/ui/actions/DeleteButton';
import { DialogActions, DialogContent } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutDeleteType, CalloutEditType } from '../CalloutEditType';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';

export interface CalloutEditDialogProps {
  open: boolean;
  calloutType: CalloutType;
  callout: CalloutLayoutProps['callout'];
  onClose: () => void;
  onDelete: (callout: CalloutDeleteType) => void;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  disableRichMedia?: boolean;
  disablePostResponses?: boolean;
}

const CalloutEditDialog = ({
  open,
  calloutType,
  callout,
  onClose,
  onDelete,
  onCalloutEdit,
  disableRichMedia,
  disablePostResponses = false,
}: CalloutEditDialogProps) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const initialValues: CalloutFormInput = {
    displayName: callout.framing.profile.displayName,
    type: callout.type,
    description: callout.framing.profile.description,
    state: callout.contributionPolicy.state,
    references: callout.framing.profile.references,
    profileId: callout.framing.profile.id,
    tags: callout.framing.profile.tagset?.tags,
    postDescription: callout.contributionDefaults.postDescription ?? '',
    whiteboardContent: callout.contributionDefaults?.whiteboardContent ?? EmptyWhiteboardString,
  };
  const [newCallout, setNewCallout] = useState<CalloutFormInput>(initialValues);
  const [closeConfirmDialogOpen, setCloseConfirmDialogOpen] = useState(false);

  const handleStatusChanged = (valid: boolean) => setValid(valid);

  const onCloseEdit = useCallback(() => {
    setCloseConfirmDialogOpen(true);
  }, []);

  const handleChange = (newCallout: CalloutFormOutput) => setNewCallout(newCallout);

  const handleSave = useCallback(async () => {
    setLoading(true);

    await onCalloutEdit({
      id: callout.id,
      profile: {
        displayName: newCallout.displayName,
        description: newCallout.description,
        references: newCallout.references,
        tagsets: [
          {
            id: callout.framing.profile.tagset?.id,
            name: DEFAULT_TAGSET,
            tags: newCallout.tags,
            allowedValues: [],
            type: TagsetType.Freeform,
          },
        ],
      },
      contributionDefaults: {
        postDescription: callout.type === CalloutType.PostCollection ? newCallout.postDescription : undefined,
        whiteboardContent: callout.type === CalloutType.WhiteboardCollection ? newCallout.whiteboardContent : undefined,
      },
      state: newCallout.state,
    });
    setLoading(false);
  }, [callout, newCallout, onCalloutEdit]);

  const CalloutIcon = calloutType ? calloutIcons[calloutType] : undefined;

  return (
    <>
      <DialogWithGrid open={open} columns={8} aria-labelledby="callout-visibility-dialog-title" onClose={onCloseEdit}>
        <DialogHeader
          icon={CalloutIcon && <CalloutIcon />}
          title={t('components.calloutEdit.titleWithType', {
            type: t(`components.calloutTypeSelect.label.${calloutType}` as const),
          })}
          onClose={onCloseEdit}
        />
        <DialogContent>
          <StorageConfigContextProvider locationType="callout" calloutId={callout.id}>
            <CalloutForm
              calloutType={calloutType}
              callout={initialValues}
              editMode
              onStatusChanged={handleStatusChanged}
              onChange={handleChange}
              disableRichMedia={disableRichMedia}
              disablePostResponses={disablePostResponses}
            />
          </StorageConfigContextProvider>
        </DialogContent>
        <DialogActions>
          <DeleteButton loading={loading} disabled={loading} onClick={() => onDelete(callout)} />
          <SaveButton loading={loading} disabled={!valid || loading} onClick={handleSave} />
        </DialogActions>
        <ConfirmationDialog
          actions={{
            onConfirm: () => {
              setCloseConfirmDialogOpen(false);
              onClose();
            },
            onCancel: () => setCloseConfirmDialogOpen(false),
          }}
          options={{
            show: closeConfirmDialogOpen,
          }}
          entities={{
            titleId: 'post-edit.closeConfirm.title',
            contentId: 'post-edit.closeConfirm.description',
            confirmButtonTextId: 'buttons.yes-close',
          }}
        />
      </DialogWithGrid>
    </>
  );
};

export default CalloutEditDialog;
