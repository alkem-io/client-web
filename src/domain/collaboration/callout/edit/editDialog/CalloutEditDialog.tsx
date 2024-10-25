import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { useTranslation } from 'react-i18next';

import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import CalloutForm, { CalloutFormInput, CalloutFormOutput } from '../../CalloutForm';
import { DialogActions, DialogContent } from '../../../../../core/ui/dialog/deprecated';
import { StorageConfigContextProvider } from '../../../../storage/StorageBucket/StorageConfigContext';

import calloutIcons from '../../utils/calloutIcons';
import { CalloutLayoutProps } from '../../calloutBlock/CalloutLayout';
import { JourneyTypeName } from '../../../../journey/JourneyTypeName';
import { CalloutDeleteType, CalloutEditType } from '../CalloutEditType';
import { DEFAULT_TAGSET } from '../../../../common/tags/tagset.constants';
import { EmptyWhiteboardString } from '../../../../common/whiteboard/EmptyWhiteboard';
import { CalloutType, TagsetType } from '../../../../../core/apollo/generated/graphql-schema';
import { useStorageConfigLocally } from '../../../../storage/StorageBucket/useStorageConfigLocally';

export type CalloutEditDialogProps = {
  open: boolean;
  calloutType: CalloutType;
  journeyTypeName: JourneyTypeName;
  callout: CalloutLayoutProps['callout'];
  onClose: () => void;
  onDelete: (callout: CalloutDeleteType) => void;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;

  canChangeCalloutLocation?: boolean;
};

const CalloutEditDialog = ({
  open,
  callout,
  calloutType,
  journeyTypeName,
  canChangeCalloutLocation,
  onClose,
  onDelete,
  onCalloutEdit,
}: CalloutEditDialogProps) => {
  const initialValues: CalloutFormInput = {
    type: callout.type,
    groupName: callout.groupName,
    profileId: callout.framing.profile.id,
    state: callout.contributionPolicy.state,
    tags: callout.framing.profile.tagset?.tags,
    references: callout.framing.profile.references,
    displayName: callout.framing.profile.displayName,
    description: callout.framing.profile.description,
    postDescription: callout.contributionDefaults.postDescription ?? '',
    whiteboardContent: callout.contributionDefaults?.whiteboardContent ?? EmptyWhiteboardString,
  };

  const [valid, setValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newCallout, setNewCallout] = useState<CalloutFormInput>(initialValues);

  const { t } = useTranslation();

  const { setLastOpenedStorageConfig } = useStorageConfigLocally();

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

  useEffect(() => {
    setLastOpenedStorageConfig(callout.id);
  }, [callout.id, setLastOpenedStorageConfig]);

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
              editMode
              callout={initialValues}
              calloutType={calloutType}
              journeyTypeName={journeyTypeName}
              canChangeCalloutLocation={canChangeCalloutLocation}
              onChange={handleChange}
              onStatusChanged={handleStatusChanged}
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
            variant="contained"
            disabled={!valid || loading}
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
