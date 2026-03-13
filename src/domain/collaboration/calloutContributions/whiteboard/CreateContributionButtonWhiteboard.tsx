import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateWhiteboardOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { normalizeLink } from '@/core/utils/links';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import CreateContributionButton from '../CreateContributionButton';
import type { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';

interface CreateContributionButtonWhiteboardProps extends CalloutContributionCreateButtonProps {}

const CreateContributionButtonWhiteboard = ({
  callout,
  canCreateContribution,
  onContributionCreated,
}: CreateContributionButtonWhiteboardProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createWhiteboard] = useCreateWhiteboardOnCalloutMutation();
  const defaultWhiteboardName =
    callout.contributionDefaults?.defaultDisplayName ?? t('pages.whiteboard.defaultWhiteboardDisplayName');
  const [whiteboardName, setWhiteboardName] = useState(defaultWhiteboardName);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setWhiteboardName(defaultWhiteboardName);
  };

  const [handleCreateWhiteboard, creatingWhiteboard] = useLoadingState(async () => {
    const whiteboardNameMandatory = ensurePresence(whiteboardName);

    const { data } = await createWhiteboard({
      variables: {
        calloutId: callout.id,
        whiteboard: {
          profile: {
            displayName: whiteboardNameMandatory,
          },
          content: callout.contributionDefaults?.whiteboardContent ?? JSON.stringify(EmptyWhiteboard),
        },
      },
      refetchQueries: ['CalloutContributions'],
      awaitRefetchQueries: true,
    });

    await onContributionCreated?.();

    if (data?.createContributionOnCallout.whiteboard?.profile.url) {
      navigate(normalizeLink(data.createContributionOnCallout.whiteboard.profile.url), {
        state: {
          [LocationStateKeyCachedCallout]: callout,
          keepScroll: true,
        },
      });
    }
    handleCloseDialog();
  });

  return (
    <>
      {canCreateContribution ? (
        <CreateContributionButton
          onClick={() => setDialogOpen(true)}
          contributionType={CalloutContributionType.Whiteboard}
        />
      ) : undefined}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogHeader
          onClose={handleCloseDialog}
          title={t('common.create-new-entity', { entity: t('common.whiteboard') })}
        />
        <DialogContent>
          <TextField
            fullWidth={true}
            label={t('fields.displayName')}
            variant="outlined"
            onChange={e => setWhiteboardName(e.target.value)}
            value={whiteboardName}
            focused={true}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleCloseDialog} disabled={creatingWhiteboard}>
            {t('buttons.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateWhiteboard}
            disabled={!whiteboardName.trim()}
            loading={creatingWhiteboard}
          >
            {t('buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CreateContributionButtonWhiteboard.displayName = 'CreateContributionButtonWhiteboard';
export default CreateContributionButtonWhiteboard;
