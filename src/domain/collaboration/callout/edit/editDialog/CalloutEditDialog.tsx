import { CalloutType, TagsetType } from '@/core/apollo/generated/graphql-schema';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { DialogActions } from '@/core/ui/dialog/deprecated';
import CalloutForm, { CalloutFormInput, CalloutFormOutput } from '@/domain/collaboration/callout/CalloutForm';
import { CalloutLayoutProps } from '@/domain/collaboration/callout/calloutBlock/CalloutLayout';
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import { DEFAULT_TAGSET } from '@/domain/common/tags/tagset.constants';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { CalloutsSetParentType } from '@/domain/journey/JourneyTypeName';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { LoadingButton } from '@mui/lab';
import { DialogContent } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutDeleteType, CalloutEditType } from '../CalloutEditType';

export interface CalloutEditDialogProps {
  open: boolean;
  calloutType: CalloutType;
  callout: CalloutLayoutProps['callout'];
  onClose: () => void;
  onDelete: (callout: CalloutDeleteType) => void;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  canChangeCalloutLocation?: boolean;
  journeyTypeName: CalloutsSetParentType;
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
  canChangeCalloutLocation,
  journeyTypeName,
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
    groupName: callout.groupName,
  };
  const [newCallout, setNewCallout] = useState<CalloutFormInput>(initialValues);

  const handleStatusChanged = (valid: boolean) => setValid(valid);

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
      groupName: newCallout.groupName,
    });
    setLoading(false);
  }, [callout, newCallout, onCalloutEdit]);

  const CalloutIcon = calloutType ? calloutIcons[calloutType] : undefined;

  return (
    <>
      <DialogWithGrid open={open} columns={8} aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
        <DialogHeader
          icon={CalloutIcon && <CalloutIcon />}
          title={t('components.calloutEdit.titleWithType', {
            type: t(`components.calloutTypeSelect.label.${calloutType}` as const),
          })}
          onClose={onClose}
        />
        <DialogContent>
          <StorageConfigContextProvider locationType="callout" calloutId={callout.id}>
            <CalloutForm
              calloutType={calloutType}
              callout={initialValues}
              editMode
              onStatusChanged={handleStatusChanged}
              onChange={handleChange}
              canChangeCalloutLocation={canChangeCalloutLocation}
              journeyTypeName={journeyTypeName}
              disableRichMedia={disableRichMedia}
              disablePostResponses={disablePostResponses}
            />
          </StorageConfigContextProvider>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <LoadingButton
            loading={loading}
            disabled={loading}
            variant="outlined"
            onClick={() => onDelete(callout)}
            aria-label={t('buttons.delete')}
          >
            {t('buttons.delete')}
          </LoadingButton>
          <LoadingButton
            loading={loading}
            disabled={!valid || loading}
            variant="contained"
            onClick={handleSave}
            aria-label={t('buttons.save')}
          >
            {t('buttons.save')}
          </LoadingButton>
        </DialogActions>
      </DialogWithGrid>
    </>
  );
};

export default CalloutEditDialog;
