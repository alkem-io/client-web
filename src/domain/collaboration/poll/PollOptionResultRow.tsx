import { Box, Typography } from '@mui/material';
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
  const percentage = option.votePercentage ?? 0;

  return (
    <Box
      sx={{
        position: 'relative',
        py: 0.75,
        px: 1,
        borderRadius: 1,
        border: 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: theme => theme.palette.action.hover,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${percentage}%`,
          backgroundColor: isSelected ? 'primary.main' : 'primary.light',
          opacity: isSelected ? 0.2 : 0.4,
          transition: 'width 0.4s ease',
          borderRadius: 'inherit',
        }}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${option.text}: ${Math.round(percentage)}%`}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {showVoters && option.voters && <PollVoterAvatars voters={option.voters} />}
      </Box>
    </Box>
  );
};

export default PollOptionResultRow;
