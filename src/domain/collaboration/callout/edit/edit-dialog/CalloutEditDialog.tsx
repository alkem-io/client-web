import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { LoadingButton } from '@mui/lab';
import { CampaignOutlined } from '@mui/icons-material';
import { DialogActions, DialogContent, DialogTitle } from '../../../../../common/components/core/dialog';
import ConfirmationDialog, {
  ConfirmationDialogProps,
} from '../../../../../common/components/composite/dialogs/ConfirmationDialog';
import { CalloutEditType } from '../CalloutEditType';
import CalloutForm, { CalloutFormInput, CalloutFormOutput } from '../../CalloutForm';
import { createCardTemplateFromTemplateSet } from '../../utils/createCardTemplateFromTemplateSet';
import { AspectTemplateFragment, CanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useHubTemplatesCanvasTemplateWithValueLazyQuery,
  useInnovationPackFullCanvasTemplateWithValueLazyQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { createCanvasTemplateForCalloutCreation } from '../../utils/createCanvasTemplateForCalloutCreation';

export interface CalloutEditDialogProps {
  open: boolean;
  title: string;
  callout: CalloutEditType;
  onClose: () => void;
  onDelete: (callout: CalloutEditType) => Promise<void>;
  onCalloutEdit: (callout: CalloutEditType) => Promise<void>;
  calloutNames: string[];
  templates: { cardTemplates: AspectTemplateFragment[]; canvasTemplates: CanvasTemplateFragment[] };
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
    cardTemplateType: callout.cardTemplate?.type,
    canvasTemplateData: { title: callout.canvasTemplate?.info.title },
  };
  const [newCallout, setNewCallout] = useState<CalloutFormInput>(initialValues);
  const [fetchCanvasValue] = useHubTemplatesCanvasTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });
  const [fetchCanvasValueFromLibrary] = useInnovationPackFullCanvasTemplateWithValueLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const handleStatusChanged = (valid: boolean) => setValid(valid);

  const handleChange = (newCallout: CalloutFormOutput) => setNewCallout(newCallout);

  const handleSave = useCallback(async () => {
    setLoading(true);
    const calloutCardTemplate = createCardTemplateFromTemplateSet(newCallout, templates.cardTemplates);
    const referenceHubCanvasTemplate = templates.canvasTemplates.find(
      template => template.info.title === newCallout.canvasTemplateData?.title
    );
    const canvasTemplateQueryResult =
      referenceHubCanvasTemplate &&
      (await fetchCanvasValue({
        variables: { hubId: hubNameId!, canvasTemplateId: referenceHubCanvasTemplate.id },
      }));

    const libraryCanvasTemplateQueryResult = referenceHubCanvasTemplate
      ? undefined
      : await fetchCanvasValueFromLibrary({
          variables: {
            innovationPackId: newCallout.canvasTemplateData?.innovationPackId!,
            canvasTemplateId: newCallout.canvasTemplateData?.id!,
          },
        });

    const calloutCanvasTemplate = createCanvasTemplateForCalloutCreation(
      canvasTemplateQueryResult?.data?.hub?.templates?.canvasTemplate ??
        libraryCanvasTemplateQueryResult?.data?.platform.library.innovationPack?.templates?.canvasTemplate
    );

    await onCalloutEdit({
      id: callout.id,
      displayName: newCallout.displayName,
      description: newCallout.description,
      state: newCallout.state,
      cardTemplate: calloutCardTemplate,
      canvasTemplate: calloutCanvasTemplate,
    });
    setLoading(false);
  }, [callout, fetchCanvasValue, newCallout, hubNameId, onCalloutEdit, templates, fetchCanvasValueFromLibrary]);

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
            <CampaignOutlined sx={{ mr: theme => theme.spacing(1) }} />
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
