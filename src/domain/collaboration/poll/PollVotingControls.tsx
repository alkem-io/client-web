import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PollResultsDetail } from '@/core/apollo/generated/graphql-schema';
import { Text } from '@/core/ui/typography';
import type { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';
import PollVoterAvatars from '@/domain/collaboration/poll/PollVoterAvatars';

type PollVotingControlsProps = {
  options: PollOptionModel[];
  selectedOptionIds: string[];
  maxResponses: number;
  minResponses: number;
  isClosed?: boolean;
  showResults?: boolean;
  resultsDetail?: PollResultsDetail;
  onChange: (selectedIds: string[]) => void;
};

const OptionLabel = ({
  option,
  showResults,
  resultsDetail,
}: {
  option: PollOptionModel;
  showResults: boolean;
  resultsDetail?: PollResultsDetail;
}) => {
  const showCount = showResults && option.voteCount != null && resultsDetail !== PollResultsDetail.Percentage;
  const showPercentage = showResults && option.votePercentage != null && resultsDetail !== PollResultsDetail.Count;
  const showBar = showResults && option.votePercentage != null;
  const showVoters = showResults && resultsDetail === PollResultsDetail.Full && option.voters != null;
  const percentage = option.votePercentage ?? 0;

  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        py: 0.5,
        px: showBar ? 1 : 0,
        borderRadius: 1,
        border: 0,
        overflow: 'hidden',
        height: '60px',
        mb: '5px',
      }}
    >
      {showBar && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${percentage}%`,
            backgroundColor: theme => theme.palette.action.hover,
            transition: 'width 0.4s ease',
            borderRadius: 'inherit',
          }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${option.text}: ${Math.round(percentage)}%`}
        />
      )}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text color="text.primary">{option.text}</Text>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0, ml: 1 }}>
            {showPercentage && (
              <Typography variant="caption" color="text.secondary">
                {Math.round(option.votePercentage ?? 0)}%
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

const PollVotingControls = ({
  options,
  selectedOptionIds,
  maxResponses,
  minResponses,
  isClosed = false,
  showResults = false,
  resultsDetail,
  onChange,
}: PollVotingControlsProps) => {
  const { t } = useTranslation();

  const isSingleChoice = maxResponses === 1;
  const isUnlimited = maxResponses === 0;
  const isMaxReached = !isUnlimited && selectedOptionIds.length >= maxResponses;
  const isBelowMin = selectedOptionIds.length < minResponses;

  if (isSingleChoice) {
    return (
      <FormControl component="fieldset" disabled={isClosed} fullWidth={true}>
        <RadioGroup value={selectedOptionIds[0] ?? ''} onChange={(_event, value) => onChange([value])}>
          {options.map(option => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={<OptionLabel option={option} showResults={showResults} resultsDetail={resultsDetail} />}
              sx={{ alignItems: 'flex-start', mr: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedOptionIds, optionId]);
    } else {
      onChange(selectedOptionIds.filter(id => id !== optionId));
    }
  };

  return (
    <FormControl component="fieldset" disabled={isClosed} fullWidth={true}>
      <FormGroup>
        {options.map(option => {
          const isSelected = selectedOptionIds.includes(option.id);
          const isDisabledByMax = !isSelected && isMaxReached;

          return (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={(_event, checked) => handleCheckboxChange(option.id, checked)}
                  disabled={isClosed || isDisabledByMax}
                />
              }
              label={<OptionLabel option={option} showResults={showResults} resultsDetail={resultsDetail} />}
              sx={{ alignItems: 'flex-start', mr: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
            />
          );
        })}
      </FormGroup>
      {!isClosed && isMaxReached && <FormHelperText>{t('poll.vote.maxReached', { max: maxResponses })}</FormHelperText>}
      {!isClosed && isBelowMin && selectedOptionIds.length > 0 && (
        <FormHelperText>{t('poll.vote.minRequired', { min: minResponses })}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PollVotingControls;
