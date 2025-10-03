import { useCreateWhiteboardOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { useState } from 'react';
import CreateContributionButton from '../CreateContributionButton';
import { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import { normalizeLink } from '@/core/utils/links';
import useNavigate from '@/core/routing/useNavigate';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import useEnsurePresence from '@/core/utils/ensurePresence';

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
  const [whiteboardName, setWhiteboardName] = useState(
    callout.contributionDefaults?.defaultDisplayName ?? t('pages.whiteboard.defaultWhiteboardDisplayName')
  );

  const createNewWhiteboard = async () => {
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
      refetchQueries: [],
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
  };

  return (
    <>
      {canCreateContribution ? <CreateContributionButton onClick={() => setDialogOpen(true)} /> : undefined}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader
          onClose={() => setDialogOpen(false)}
          title={t('common.create-new-entity', { entity: t('common.whiteboard') })}
        />
        <DialogContent>
          <TextField
            fullWidth
            label={t('fields.displayName')}
            variant="outlined"
            onChange={e => setWhiteboardName(e.target.value)}
            value={whiteboardName}
            focused
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDialogOpen(false)}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="contained" onClick={createNewWhiteboard} disabled={!whiteboardName.trim()}>
            {t('buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CreateContributionButtonWhiteboard.displayName = 'CreateContributionButtonWhiteboard';
export default CreateContributionButtonWhiteboard;
