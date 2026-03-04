import { Box, LinearProgress, Typography } from '@mui/material';
import { PollResultsDetail } from '@/core/apollo/generated/graphql-schema';
import { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';
import PollVoterAvatars from '@/domain/collaboration/poll/PollVoterAvatars';

type PollOptionResultRowProps = {
  option: PollOptionModel;
  resultsDetail: PollResultsDetail;
  isSelected: boolean;
};

const PollOptionResultRow = ({ option, resultsDetail, isSelected }: PollOptionResultRowProps) => {
  const showCount = option.voteCount != null && resultsDetail !== PollResultsDetail.Percentage;
  const showPercentage = option.votePercentage != null && resultsDetail !== PollResultsDetail.Count;
  const showVoters = resultsDetail === PollResultsDetail.Full && option.voters != null;

  return (
    <Box
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        border: 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected ? 'primary.light' : 'transparent',
        opacity: isSelected ? 1 : 0.85,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
          {option.text}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {showPercentage && (
            <Typography variant="caption" color="text.secondary">
              {Math.round(option.votePercentage!)}%
            </Typography>
          )}
          {showCount && (
            <Typography variant="caption" color="text.secondary">
              ({option.voteCount})
            </Typography>
          )}
        </Box>
      </Box>

      {option.votePercentage != null && (
        <LinearProgress
          variant="determinate"
          value={option.votePercentage}
          aria-label={`${option.text}: ${Math.round(option.votePercentage)}%`}
          sx={{ borderRadius: 1, height: 6, mb: showVoters ? 0.5 : 0 }}
        />
      )}

      {showVoters && <PollVoterAvatars voters={option.voters} />}
    </Box>
  );
};

export default PollOptionResultRow;
