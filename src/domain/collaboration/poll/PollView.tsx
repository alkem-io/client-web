import { Box, Button } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PollStatus } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography/components';
import { usePollVote } from '@/domain/collaboration/poll/hooks/usePollVote';
import type { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';
import PollVotingControls from '@/domain/collaboration/poll/PollVotingControls';

type PollViewProps = {
  poll: PollDetailsModel;
  canVote?: boolean;
};

const PollView = ({ poll, canVote = false }: PollViewProps) => {
  const { t } = useTranslation();

  const mySelectedOptionIds = poll.myVote?.selectedOptions.map(o => o.id) ?? [];
  const hasVoted = poll.myVote !== null;
  const isClosed = poll.status === PollStatus.Closed;

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(mySelectedOptionIds);
  const [isChangingVote, setIsChangingVote] = useState(false);
  const [voteRevoked, setVoteRevoked] = useState(false);
  const hadVotedRef = useRef(hasVoted);

  // Handle vote revocation from subscription updates (myVote goes non-null → null)
  useEffect(() => {
    if (hadVotedRef.current && !hasVoted) {
      setIsChangingVote(false);
      setSelectedOptionIds([]);
      setVoteRevoked(true);
    }
    hadVotedRef.current = hasVoted;
  }, [hasVoted]);

  // When changing vote and options update via subscription, remove selections for deleted options
  useEffect(() => {
    if (isChangingVote) {
      const currentOptionIds = new Set(poll.options.map(o => o.id));
      setSelectedOptionIds(prev => prev.filter(id => currentOptionIds.has(id)));
    }
  }, [poll.options, isChangingVote]);

  const { castVote, loading, error: voteError } = usePollVote({ pollId: poll.id, poll });

  const isVotingMode = canVote && !isClosed && (!hasVoted || isChangingVote);
  const showResults = poll.canSeeDetailedResults;
  const showTotalOnly = !poll.canSeeDetailedResults && poll.totalVotes != null;
  const isBelowMin = selectedOptionIds.length < poll.settings.minResponses;

  const handleVoteSubmit = () => {
    castVote(selectedOptionIds);
    setIsChangingVote(false);
    setVoteRevoked(false);
  };

  const handleChangeVote = () => {
    setSelectedOptionIds(mySelectedOptionIds);
    setIsChangingVote(true);
  };

  const handleCancelChange = () => {
    setSelectedOptionIds(mySelectedOptionIds);
    setIsChangingVote(false);
  };

  // Determine which option IDs to display as selected in the controls
  const displayedSelectedIds = isVotingMode ? selectedOptionIds : mySelectedOptionIds;

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
        selectedOptionIds={displayedSelectedIds}
        maxResponses={poll.settings.maxResponses}
        minResponses={poll.settings.minResponses}
        disabled={loading}
        readOnly={!isVotingMode}
        showResults={showResults}
        resultsDetail={poll.settings.resultsDetail}
        onChange={setSelectedOptionIds}
      />

      {isVotingMode && (
        <Gutters row={true} disablePadding={true} mt={1}>
          <Button
            variant="contained"
            onClick={handleVoteSubmit}
            disabled={loading || isBelowMin || selectedOptionIds.length === 0}
          >
            {t('poll.vote.button')}
          </Button>
          {isChangingVote && (
            <Button onClick={handleCancelChange} disabled={loading} variant="outlined">
              {t('poll.vote.cancelButton')}
            </Button>
          )}
        </Gutters>
      )}

      {!isVotingMode && hasVoted && canVote && !isClosed && (
        <Box mt={1}>
          <Button variant="text" onClick={handleChangeVote}>
            {t('poll.vote.changeMyVote')}
          </Button>
        </Box>
      )}

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
    </Box>
  );
};

export default PollView;
