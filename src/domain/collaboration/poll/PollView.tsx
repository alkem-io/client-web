import { Box, CircularProgress, Link } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PollResultsVisibility, PollStatus } from '@/core/apollo/generated/graphql-schema';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography/components';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import { usePollVote } from '@/domain/collaboration/poll/hooks/usePollVote';
import type { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';
import PollVotingControls from '@/domain/collaboration/poll/PollVotingControls';

const CHECKBOX_DEBOUNCE_MS = 2_000;
const MAX_POLL_OPTIONS = 10;

type PollViewProps = {
  poll: PollDetailsModel;
  canVote?: boolean;
};

const PollView = ({ poll, canVote = false }: PollViewProps) => {
  const { t } = useTranslation();

  const mySelectedOptionIds = poll.myVote?.selectedOptions.map(o => o.id) ?? [];
  const hasVoted = !!poll.myVote;
  const isClosed = poll.status === PollStatus.Closed;
  const isAnonymous = !(poll.settings.resultsVisibility === PollResultsVisibility.Visible);
  const isSingleChoice = poll.settings.maxResponses === 1;

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(mySelectedOptionIds);
  const selectedOptionIdsRef = useRef(selectedOptionIds);
  selectedOptionIdsRef.current = selectedOptionIds;
  const [voteRevoked, setVoteRevoked] = useState(false);
  const [addingOptionStatus, setAddingOptionStatus] = useState<'idle' | 'adding' | 'voting'>('idle');
  const hadVotedRef = useRef(hasVoted);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local selection with server state when myVote changes (e.g., after mutation or subscription)
  useEffect(() => {
    const serverIds = poll.myVote?.selectedOptions.map(o => o.id) ?? [];
    setSelectedOptionIds(serverIds);
  }, [poll.myVote]);

  // Handle vote revocation from subscription updates (myVote goes non-null → null)
  useEffect(() => {
    if (hadVotedRef.current && !hasVoted) {
      setSelectedOptionIds([]);
      setVoteRevoked(true);
    }
    hadVotedRef.current = hasVoted;
  }, [hasVoted]);

  // When options update via subscription, remove selections for deleted options
  useEffect(() => {
    const currentOptionIds = new Set(poll.options.map(o => o.id));
    setSelectedOptionIds(prev => {
      const filtered = prev.filter(id => currentOptionIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [poll.options]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const { castVote, removeVote, loading: voteLoading, error: voteError } = usePollVote({ pollId: poll.id, poll });
  const { addOption } = usePollOptionManagement({ pollId: poll.id });

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const showResults = poll.canSeeDetailedResults;
  const showTotalOnly = !poll.canSeeDetailedResults && poll.totalVotes != null;

  const showAddCustomOption =
    poll.settings.allowContributorsAddOptions && canVote && !isClosed && poll.options.length < MAX_POLL_OPTIONS;

  const loading = voteLoading || addingOptionStatus !== 'idle';

  const submitVote = (optionIds: string[]) => {
    if (optionIds.length < poll.settings.minResponses) return;
    castVote(optionIds);
    setVoteRevoked(false);
  };

  const handleChange = (newSelectedIds: string[]) => {
    setSelectedOptionIds(newSelectedIds);

    if (!canVote || isClosed) return;

    if (debounceTimerRef.current) {
      // Clear any pending debounce
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (isSingleChoice) {
      // Single-choice: emit immediately
      submitVote(newSelectedIds);
    } else {
      // Multi-choice: debounce 2 seconds
      if (newSelectedIds.length >= poll.settings.minResponses) {
        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          submitVote(newSelectedIds);
        }, CHECKBOX_DEBOUNCE_MS);
      }
    }
  };

  const handleSubmitCustomOption = async (text: string) => {
    if (!canVote || isClosed) return;

    // Cancel any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setAddingOptionStatus('adding');
    try {
      const result = await addOption(text);
      const updatedPoll = result.data?.addPollOption;
      if (!updatedPoll) return;

      // Find the new option by comparing with current options
      const currentOptionIds = new Set(poll.options.map(o => o.id));
      const newOption = updatedPoll.options.find(o => !currentOptionIds.has(o.id));
      if (!newOption) return;

      setAddingOptionStatus('voting');

      const voteOptionIds = isSingleChoice ? [newOption.id] : [...selectedOptionIdsRef.current, newOption.id];

      await castVote(voteOptionIds);
      setVoteRevoked(false);
    } finally {
      setAddingOptionStatus('idle');
    }
  };

  const statusMessage =
    addingOptionStatus === 'adding'
      ? t('poll.status.addingOption')
      : addingOptionStatus === 'voting'
        ? t('poll.status.submitting')
        : voteLoading
          ? t('poll.status.submitting')
          : null;

  return (
    <Box>
      {poll.title && (
        <Box display="flex" flexDirection="row" justifyContent="space-between" mb={2}>
          <Caption color="text.primary">{poll.title}</Caption>
          {showTotalOnly && (
            <Caption color="text.secondary">{t('poll.results.totalVotes', { count: poll.totalVotes ?? 0 })}</Caption>
          )}
        </Box>
      )}
      <PollVotingControls
        options={poll.options}
        selectedOptionIds={selectedOptionIds}
        maxResponses={poll.settings.maxResponses}
        minResponses={poll.settings.minResponses}
        isClosed={isClosed}
        showResults={showResults}
        resultsDetail={poll.settings.resultsDetail}
        onChange={handleChange}
        showAddCustomOption={showAddCustomOption}
        onSubmitCustomOption={handleSubmitCustomOption}
        isAddingCustomOption={addingOptionStatus !== 'idle'}
      />

      <Box mt={1} display="flex" alignItems="center" gap={0.5} justifyContent="space-between">
        {statusMessage && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={12} />
            <Caption color="text.secondary">{statusMessage}</Caption>
          </Box>
        )}
        {!loading && hasVoted && !isClosed && (
          <Caption color="text.secondary">
            {t('poll.status.voted')}{' '}
            <Link
              component="button"
              variant="caption"
              sx={{ verticalAlign: 'baseline' }}
              onClick={() => setConfirmRemoveOpen(true)}
            >
              {t('poll.status.removeMyVote')}
            </Link>
          </Caption>
        )}
        {isClosed && <Caption color="text.secondary">{t('poll.status.closed')}</Caption>}
        {isAnonymous && <Caption color="text.secondary">{t('poll.results.anonymousPoll')}</Caption>}
      </Box>

      {!showResults && !showTotalOnly && poll.totalVotes === 0 && (
        <Box textAlign="center" paddingY={gutters()}>
          <Caption color="text.secondary">{t('poll.results.noVotes')}</Caption>
        </Box>
      )}

      {voteRevoked && !hasVoted && (
        <Caption color="warning.main" sx={{ mt: 1 }}>
          {t('poll.subscription.voteRevoked')}
        </Caption>
      )}

      {voteError && (
        <Caption color="error" sx={{ mt: 1 }}>
          {t('poll.error.voteFailed')}
        </Caption>
      )}

      <ConfirmationDialog
        entities={{
          titleId: 'poll.removeVoteConfirm.title',
          contentId: 'poll.removeVoteConfirm.content',
          confirmButtonTextId: 'poll.removeVoteConfirm.confirm',
        }}
        options={{
          show: confirmRemoveOpen,
        }}
        actions={{
          onConfirm: () => {
            removeVote();
            setConfirmRemoveOpen(false);
          },
          onCancel: () => setConfirmRemoveOpen(false),
        }}
        state={{
          isLoading: loading,
        }}
      />
    </Box>
  );
};

export default PollView;
