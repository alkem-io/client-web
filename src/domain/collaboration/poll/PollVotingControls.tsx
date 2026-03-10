import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  LinearProgress,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PollResultsDetail } from '@/core/apollo/generated/graphql-schema';
import { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';
import PollVoterAvatars from '@/domain/collaboration/poll/PollVoterAvatars';

type PollVotingControlsProps = {
  options: PollOptionModel[];
  selectedOptionIds: string[];
  maxResponses: number;
  minResponses: number;
  disabled?: boolean;
  readOnly?: boolean;
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

  return (
    <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2">{option.text}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0, ml: 1 }}>
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
      {showBar && (
        <LinearProgress
          variant="determinate"
          value={option.votePercentage!}
          aria-label={`${option.text}: ${Math.round(option.votePercentage!)}%`}
          sx={{ borderRadius: 1, height: 6, mt: 0.5 }}
        />
      )}
      {showVoters && option.voters && <PollVoterAvatars voters={option.voters} />}
    </Box>
  );
};

const PollVotingControls = ({
  options,
  selectedOptionIds,
  maxResponses,
  minResponses,
  disabled = false,
  readOnly = false,
  showResults = false,
  resultsDetail,
  onChange,
}: PollVotingControlsProps) => {
  const { t } = useTranslation();

  const isSingleChoice = maxResponses === 1;
  const isUnlimited = maxResponses === 0;
  const isMaxReached = !isUnlimited && selectedOptionIds.length >= maxResponses;
  const isBelowMin = selectedOptionIds.length < minResponses;
  const isDisabled = disabled || readOnly;

  if (isSingleChoice) {
    return (
      <FormControl component="fieldset" disabled={isDisabled} fullWidth>
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
    <FormControl component="fieldset" disabled={isDisabled} fullWidth>
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
                  disabled={isDisabled || isDisabledByMax}
                />
              }
              label={<OptionLabel option={option} showResults={showResults} resultsDetail={resultsDetail} />}
              sx={{ alignItems: 'flex-start', mr: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
            />
          );
        })}
      </FormGroup>
      {!readOnly && isMaxReached && <FormHelperText>{t('poll.vote.maxReached', { max: maxResponses })}</FormHelperText>}
      {!readOnly && isBelowMin && selectedOptionIds.length > 0 && (
        <FormHelperText>{t('poll.vote.minRequired', { min: minResponses })}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PollVotingControls;
