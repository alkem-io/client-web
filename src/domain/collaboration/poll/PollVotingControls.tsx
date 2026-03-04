import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';

type PollVotingControlsProps = {
  options: PollOptionModel[];
  selectedOptionIds: string[];
  maxResponses: number;
  minResponses: number;
  disabled?: boolean;
  onChange: (selectedIds: string[]) => void;
};

const PollVotingControls = ({
  options,
  selectedOptionIds,
  maxResponses,
  minResponses,
  disabled = false,
  onChange,
}: PollVotingControlsProps) => {
  const { t } = useTranslation();

  const isSingleChoice = maxResponses === 1;
  const isUnlimited = maxResponses === 0;
  const isMaxReached = !isUnlimited && selectedOptionIds.length >= maxResponses;
  const isBelowMin = selectedOptionIds.length < minResponses;

  if (isSingleChoice) {
    return (
      <FormControl component="fieldset" disabled={disabled} fullWidth>
        <RadioGroup value={selectedOptionIds[0] ?? ''} onChange={(_event, value) => onChange([value])}>
          {options.map(option => (
            <FormControlLabel key={option.id} value={option.id} control={<Radio />} label={option.text} />
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
    <FormControl component="fieldset" disabled={disabled} fullWidth>
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
                  disabled={disabled || isDisabledByMax}
                />
              }
              label={option.text}
            />
          );
        })}
      </FormGroup>
      {isMaxReached && <FormHelperText>{t('poll.vote.maxReached', { max: maxResponses })}</FormHelperText>}
      {isBelowMin && selectedOptionIds.length > 0 && (
        <FormHelperText>{t('poll.vote.minRequired', { min: minResponses })}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PollVotingControls;
