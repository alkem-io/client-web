import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PollResultsDetail } from '@/core/apollo/generated/graphql-schema';
import { Caption, CaptionSmall, Text } from '@/core/ui/typography';
import type { PollOptionModel } from '@/domain/collaboration/poll/models/PollModels';
import PollVoterAvatars from '@/domain/collaboration/poll/PollVoterAvatars';

const CUSTOM_OPTION_SENTINEL = '__custom__';

type PollVotingControlsProps = {
  options: PollOptionModel[];
  selectedOptionIds: string[];
  maxResponses: number;
  minResponses: number;
  isClosed?: boolean;
  showResults?: boolean;
  resultsDetail?: PollResultsDetail;
  onChange: (selectedIds: string[]) => void;
  showAddCustomOption?: boolean;
  onSubmitCustomOption?: (text: string) => void;
  isAddingCustomOption?: boolean;
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
            {showPercentage && <Caption color="text.secondary">{Math.round(option.votePercentage ?? 0)}%</Caption>}
            {showCount && <Caption color="text.secondary">({option.voteCount})</Caption>}
          </Box>
        </Box>
        {showVoters && option.voters && <PollVoterAvatars voters={option.voters} />}
      </Box>
    </Box>
  );
};

const CustomOptionRow = ({
  isActive,
  onActivate,
  onDeactivate,
  onSubmit,
  isLoading,
}: {
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onSubmit: (text: string) => void;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = text.trim().length > 0 && text.length <= 512;

  const handleSubmit = () => {
    if (!isValid || isLoading) return;
    onSubmit(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onDeactivate();
    }
  };

  if (!isActive) {
    return (
      <Box
        sx={{ cursor: 'pointer', py: 1, display: 'flex', alignItems: 'start', height: '60px', mb: '5px' }}
        onClick={onActivate}
      >
        <CaptionSmall color="text.secondary">{t('poll.customOption.placeholder')}</CaptionSmall>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 0.5, display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, height: '60px', mb: '5px' }}>
      <TextField
        inputRef={inputRef}
        autoFocus={true}
        fullWidth={true}
        size="small"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('poll.customOption.placeholder')}
        disabled={isLoading}
        slotProps={{
          htmlInput: { maxLength: 512 },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSubmit} disabled={!isValid || isLoading} edge="end">
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onMouseDown={e => e.preventDefault()}
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeactivate();
                  }}
                  disabled={isLoading}
                  edge="end"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
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
  showAddCustomOption = false,
  onSubmitCustomOption,
  isAddingCustomOption = false,
}: PollVotingControlsProps) => {
  const { t } = useTranslation();

  const [customOptionActive, setCustomOptionActive] = useState(false);

  const isSingleChoice = maxResponses === 1;
  const isUnlimited = maxResponses === 0;
  const isMaxReached = !isUnlimited && selectedOptionIds.length >= maxResponses;
  const isBelowMin = selectedOptionIds.length < minResponses;

  const handleCustomOptionActivate = () => {
    setCustomOptionActive(true);
  };

  const handleCustomOptionDeactivate = () => {
    setCustomOptionActive(false);
  };

  const handleCustomOptionSubmit = (text: string) => {
    onSubmitCustomOption?.(text);
    setCustomOptionActive(false);
  };

  if (isSingleChoice) {
    const radioValue = customOptionActive ? CUSTOM_OPTION_SENTINEL : (selectedOptionIds[0] ?? '');

    return (
      <FormControl component="fieldset" disabled={isClosed} fullWidth={true}>
        <RadioGroup
          value={radioValue}
          onChange={(_event, value) => {
            if (value === CUSTOM_OPTION_SENTINEL) {
              handleCustomOptionActivate();
            } else {
              setCustomOptionActive(false);
              onChange([value]);
            }
          }}
        >
          {options.map(option => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={<OptionLabel option={option} showResults={showResults} resultsDetail={resultsDetail} />}
              sx={{ alignItems: 'flex-start', mr: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
            />
          ))}
          {showAddCustomOption && (
            <FormControlLabel
              value={CUSTOM_OPTION_SENTINEL}
              control={<Radio />}
              label={
                <CustomOptionRow
                  isActive={customOptionActive}
                  onActivate={handleCustomOptionActivate}
                  onDeactivate={handleCustomOptionDeactivate}
                  onSubmit={handleCustomOptionSubmit}
                  isLoading={isAddingCustomOption}
                />
              }
              sx={{ alignItems: 'flex-start', mr: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
            />
          )}
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
        {showAddCustomOption && (
          <FormControlLabel
            control={
              <Checkbox
                checked={customOptionActive}
                onChange={(_event, checked) => {
                  if (checked) {
                    handleCustomOptionActivate();
                  } else {
                    handleCustomOptionDeactivate();
                  }
                }}
                disabled={isClosed}
              />
            }
            label={
              <CustomOptionRow
                isActive={customOptionActive}
                onActivate={handleCustomOptionActivate}
                onDeactivate={handleCustomOptionDeactivate}
                onSubmit={handleCustomOptionSubmit}
                isLoading={isAddingCustomOption}
              />
            }
            sx={{ alignItems: 'flex-start', mr: 0, '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 } }}
          />
        )}
      </FormGroup>
      {!isClosed && isMaxReached && <FormHelperText>{t('poll.vote.maxReached', { max: maxResponses })}</FormHelperText>}
      {!isClosed && isBelowMin && selectedOptionIds.length > 0 && (
        <FormHelperText>{t('poll.vote.minRequired', { min: minResponses })}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PollVotingControls;
