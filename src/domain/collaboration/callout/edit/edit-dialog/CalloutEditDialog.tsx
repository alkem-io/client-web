import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import { CalloutIcon } from '../../icon/CalloutIcon';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';
import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '../../../../../common/components/composite/dialogs/ConfirmationDialog';
import { CalloutEditType } from '../CalloutEditType';
import CalloutForm, { CalloutFormInput, CalloutFormOutput } from '../../CalloutForm';
import { createPostTemplateFromTemplateSet } from '../../utils/createPostTemplateFromTemplateSet';
import { PostTemplateFragment, WhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useHubTemplatesWhiteboardTemplateWithValueLazyQuery,
  useInnovationPackFullWhiteboardTemplateWithValueLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { createWhiteboardTemplateForCalloutCreation } from '../../utils/createWhiteboardTemplateForCalloutCreation';

export interface CalloutEditDialogProps {
  open: boolean;
  title: string;
  callout: CalloutEditType;
  onClose: () => void;
  onDelete: (callout: CalloutEditType) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  calloutNames: string[];
  templates: { postTemplates: PostTemplateFragment[]; whiteboardTemplates: WhiteboardTemplateFragment[] };
}

const CalloutEditDialog: FC<CalloutEditDialogProps> = ({
  open,
  title,
  callout,
  onClose,
  onDelete,
  onCalloutEdit,
  calloutNames,
  templates,
}) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(true);
  const initialValues: CalloutFormInput = {
    ...callout,
    displayName: callout.profile.displayName,
    description: callout.profile.description,
    postTemplateType: callout.postTemplate?.type,
    whiteboardTemplateData: {
      id: callout.whiteboardTemplate?.id,
      displayName: callout.whiteboardTemplate?.profile.displayName,
    },
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
    const calloutPostTemplate = createPostTemplateFromTemplateSet(newCallout, templates.postTemplates);
    const getCanvasValueFromHub = async () => {
      const result = await fetchCanvasValueFromHub({
        variables: { hubId: hubNameId!, whiteboardTemplateId: newCallout.whiteboardTemplateData?.id! },
      });
      return result.data?.hub.templates;
    };

    const getCanvasValueFromLibrary = async () => {
      const result = await fetchCanvasValueFromLibrary({
        variables: {
          innovationPackId: newCallout.whiteboardTemplateData?.innovationPackId!,
          whiteboardTemplateId: newCallout.whiteboardTemplateData?.id!,
        },
      });
      return result.data?.platform.library.innovationPack?.templates;
    };

    const fetchCanvasValue = async () => {
      if (!newCallout.whiteboardTemplateData?.origin) return undefined;
      return newCallout.whiteboardTemplateData?.origin === 'Hub'
        ? await getCanvasValueFromHub()
        : await getCanvasValueFromLibrary();
    };

    const queryResult = await fetchCanvasValue();

    const calloutWhiteboardTemplate = createWhiteboardTemplateForCalloutCreation(queryResult?.whiteboardTemplate);

    await onCalloutEdit({
      id: callout.id,
      profile: {
        displayName: newCallout.displayName,
        description: newCallout.description,
      },
      state: newCallout.state,
      postTemplate: calloutPostTemplate,
      whiteboardTemplate: calloutWhiteboardTemplate,
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

  return (
    <>
      <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="callout-visibility-dialog-title" onClose={onClose}>
        <DialogTitle onClose={onClose}>
          <Box display="flex" alignItems="center">
            <CalloutIcon sx={{ marginRight: theme => theme.spacing(1) }} />
            {title}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <CalloutForm
            callout={initialValues}
            calloutNames={calloutNames}
            editMode
            onStatusChanged={handleStatusChanged}
            onChange={handleChange}
            templates={templates}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          {/* TODO "negative" is not a valid Button.color */}
          {/* @ts-ignore */}
          <LoadingButton
            loading={loading}
            disabled={loading}
            variant="outlined"
            color="negative"
            onClick={handleDialogDelete}
          >
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
