import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import calloutIcons from '../../utils/calloutIcons';
import { DialogActions, DialogContent } from '../../../../../common/components/core/dialog';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import ConfirmationDialog, { ConfirmationDialogProps } from '../../../../../core/ui/dialogs/ConfirmationDialog';
import { CalloutDeleteType, CalloutEditType } from '../CalloutEditType';
import CalloutForm, { CalloutFormInput, CalloutFormOutput } from '../../CalloutForm';
import {
  CalloutType,
  PostTemplateFragment,
  WhiteboardTemplateFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import {
  useHubTemplatesWhiteboardTemplateWithValueLazyQuery,
  useInnovationPackFullWhiteboardTemplateWithValueLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { CalloutLayoutProps } from '../../../CalloutBlock/CalloutLayout';
import EmptyWhiteboard from '../../../../../common/components/composite/entities/Canvas/EmptyWhiteboard';

export interface CalloutEditDialogProps {
  open: boolean;
  calloutType: CalloutType;
  callout: CalloutLayoutProps['callout'];
  onClose: () => void;
  onDelete: (callout: CalloutDeleteType) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  canChangeCalloutGroup?: boolean;
  calloutNames: string[];
  templates: { postTemplates: PostTemplateFragment[]; whiteboardTemplates: WhiteboardTemplateFragment[] };
}

const CalloutEditDialog: FC<CalloutEditDialogProps> = ({
  open,
  calloutType,
  callout,
  onClose,
  onDelete,
  onCalloutEdit,
  canChangeCalloutGroup,
  calloutNames,
  templates,
}) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const initialValues: CalloutFormInput = {
    displayName: callout.profile.displayName,
    type: callout.type,
    description: callout.profile.description,
    state: callout.state,
    references: callout.profile.references,
    profileId: callout.profile.id,
    tags: callout.profile.tagset?.tags,
    postTemplateData: {
      profile: {
        displayName: '',
      },
      defaultDescription: callout.postTemplate?.defaultDescription ?? '',
      type: callout.postTemplate?.type ?? '',
    },
    whiteboardTemplateData: {
      value: callout.whiteboardTemplate?.value ?? JSON.stringify(EmptyWhiteboard),
      profile: {
        displayName:
          callout.whiteboardTemplate?.profile.displayName ?? t('components.callout-creation.custom-template'),
      },
    },
    group: callout.group,
  };
  const [newCallout, setNewCallout] = useState<CalloutFormInput>(initialValues);
  const [fetchCanvasValueFromHub] = useHubTemplatesWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });
  const [fetchCanvasValueFromLibrary] = useInnovationPackFullWhiteboardTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

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
        tagsets: [{ id: callout.profile.tagset?.id, name: 'default', tags: newCallout.tags }],
      },
      state: newCallout.state,
      postTemplate: newCallout.postTemplateData,
      whiteboardTemplate: newCallout.whiteboardTemplateData,
      group: newCallout.group,
    });
    setLoading(false);
  }, [callout, fetchCanvasValueFromHub, newCallout, hubNameId, onCalloutEdit, templates, fetchCanvasValueFromLibrary]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    await onDelete(callout);
    setLoading(false);
  }, [onDelete, callout]);

  const handleDialogDelete = () => setConfirmDialogOpened(true);

  const [confirmDialogOpened, setConfirmDialogOpened] = useState(false);

  const confirmationDialogProps = useMemo<ConfirmationDialogProps>(
    () => ({
      entities: {
        titleId: 'callout.delete-confirm-title',
        contentId: 'callout.delete-confirm-text',
        confirmButtonTextId: 'buttons.delete',
      },
      options: {
        show: confirmDialogOpened,
      },
      actions: {
        onConfirm: handleDelete,
        onCancel: () => setConfirmDialogOpened(false),
      },
    }),
    [confirmDialogOpened, handleDelete, setConfirmDialogOpened]
  );

  const CalloutIcon = calloutType ? calloutIcons[calloutType] : undefined;

  return (
    <>
      <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
        <DialogHeader onClose={onClose}>
          <Box display="flex" alignItems="center" gap={1}>
            {CalloutIcon && <CalloutIcon />}
            {t('components.calloutEdit.titleWithType', {
              type: t(`components.calloutTypeSelect.label.${calloutType}` as const),
            })}
          </Box>
        </DialogHeader>
        <DialogContent dividers>
          <CalloutForm
            calloutType={calloutType}
            callout={initialValues}
            calloutNames={calloutNames}
            editMode
            onStatusChanged={handleStatusChanged}
            onChange={handleChange}
            canChangeCalloutGroup={canChangeCalloutGroup}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <LoadingButton loading={loading} disabled={loading} variant="outlined" onClick={handleDialogDelete}>
            {t('buttons.delete')}
          </LoadingButton>
          <LoadingButton loading={loading} disabled={!valid || loading} variant="contained" onClick={handleSave}>
            {t('buttons.save')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog {...confirmationDialogProps} />
    </>
  );
};

export default CalloutEditDialog;
