import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PollDetailsModel } from '@/domain/collaboration/poll/models/PollModels';
import { PollStatus } from '@/core/apollo/generated/graphql-schema';
import PollVotingControls from '@/domain/collaboration/poll/PollVotingControls';
import PollResultsDisplay from '@/domain/collaboration/poll/PollResultsDisplay';
import { usePollVote } from '@/domain/collaboration/poll/hooks/usePollVote';
import { Caption } from '@/core/ui/typography/components';
import { gutters } from '@/core/ui/grid/utils';

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

  const { castVote, loading, error: voteError } = usePollVote({ pollId: poll.id, poll });

  const isVotingMode = canVote && !isClosed && (!hasVoted || isChangingVote);
  const showResults = poll.canSeeDetailedResults && !isVotingMode;
  const showTotalOnly = !poll.canSeeDetailedResults && poll.totalVotes != null;
  const isBelowMin = selectedOptionIds.length < poll.settings.minResponses;

  const handleVoteSubmit = () => {
    castVote(selectedOptionIds);
    setIsChangingVote(false);
  };

  const handleChangeVote = () => {
    setSelectedOptionIds(mySelectedOptionIds);
    setIsChangingVote(true);
  };

  const handleCancelChange = () => {
    setSelectedOptionIds(mySelectedOptionIds);
    setIsChangingVote(false);
  };

  return (
    <Box>
      {isVotingMode && (
        <Box>
          <PollVotingControls
            options={poll.options}
            selectedOptionIds={selectedOptionIds}
            maxResponses={poll.settings.maxResponses}
            minResponses={poll.settings.minResponses}
            disabled={loading}
            onChange={setSelectedOptionIds}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleVoteSubmit}
              disabled={loading || isBelowMin || selectedOptionIds.length === 0}
            >
              {t('poll.vote.button')}
            </Button>
            {isChangingVote && (
              <Button size="small" onClick={handleCancelChange} disabled={loading}>
                {t('poll.vote.cancelButton')}
              </Button>
            )}
          </Box>
        </Box>
      )}

      {!isVotingMode && hasVoted && canVote && !isClosed && (
        <Box sx={{ mb: 1 }}>
          <Button size="small" variant="outlined" onClick={handleChangeVote}>
            {t('poll.vote.changeButton')}
          </Button>
        </Box>
      )}

      {showResults && (
        <PollResultsDisplay
          options={poll.options}
          resultsDetail={poll.settings.resultsDetail}
          totalVotes={poll.totalVotes}
          selectedOptionIds={mySelectedOptionIds}
        />
      )}

      {showTotalOnly && !showResults && (
        <Caption color="text.secondary">{t('poll.results.totalVotes', { count: poll.totalVotes ?? 0 })}</Caption>
      )}

      {!showResults && !showTotalOnly && poll.totalVotes === 0 && (
        <Box textAlign="center" paddingY={gutters()}>
          <Caption color="text.secondary">{t('poll.results.noVotes')}</Caption>
        </Box>
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
