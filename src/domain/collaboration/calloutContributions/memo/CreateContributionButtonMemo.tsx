import { useCreateMemoOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { useState } from 'react';
import CreateContributionButton from '../CreateContributionButton';
import { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import { normalizeLink } from '@/core/utils/links';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import useEnsurePresence from '@/core/utils/ensurePresence';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { CalloutContributionType } from '@/core/apollo/generated/graphql-schema';

interface CreateContributionButtonMemoProps extends CalloutContributionCreateButtonProps {}

const CreateContributionButtonMemo = ({
  callout,
  canCreateContribution,
  onContributionCreated,
}: CreateContributionButtonMemoProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createMemo] = useCreateMemoOnCalloutMutation();
  const [memoName, setMemoName] = useState(callout.contributionDefaults?.defaultDisplayName ?? t('common.Memo'));

  const [handleCreateMemo, creatingMemo] = useLoadingState(async () => {
    const memoNameMandatory = ensurePresence(memoName);

    const { data } = await createMemo({
      variables: {
        calloutId: callout.id,
        memo: {
          profile: {
            displayName: memoNameMandatory,
          },
          markdown: callout.contributionDefaults?.postDescription ?? '',
        },
      },
      refetchQueries: ['CalloutContributions'],
      awaitRefetchQueries: true,
    });

    await onContributionCreated?.();

    if (data?.createContributionOnCallout.memo?.profile.url) {
      navigate(normalizeLink(data.createContributionOnCallout.memo.profile.url), {
        state: {
          [LocationStateKeyCachedCallout]: callout,
          keepScroll: true,
        },
      });
    }
  });

  return (
    <>
      {canCreateContribution ? (
        <CreateContributionButton onClick={() => setDialogOpen(true)} contributionType={CalloutContributionType.Memo} />
      ) : undefined}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader
          onClose={() => setDialogOpen(false)}
          title={t('common.create-new-entity', { entity: t('common.memo') })}
        />
        <DialogContent>
          <TextField
            fullWidth
            label={t('fields.displayName')}
            variant="outlined"
            onChange={e => setMemoName(e.target.value)}
            value={memoName}
            focused
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDialogOpen(false)} disabled={creatingMemo}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="contained" onClick={handleCreateMemo} disabled={!memoName.trim()} loading={creatingMemo}>
            {t('buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CreateContributionButtonMemo.displayName = 'CreateContributionButtonMemo';
export default CreateContributionButtonMemo;
