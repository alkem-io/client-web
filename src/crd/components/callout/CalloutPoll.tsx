import { Check, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PollVoterAvatars } from '@/crd/components/common/PollVoterAvatars';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Checkbox } from '@/crd/primitives/checkbox';
import { Progress } from '@/crd/primitives/progress';
import { RadioGroup, RadioGroupItem } from '@/crd/primitives/radio-group';

// --- Types ---

export type PollVoterData = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type PollOptionData = {
  id: string;
  text: string;
  sortOrder: number;
  voteCount?: number;
  votePercentage?: number;
  isSelected: boolean;
  voters?: PollVoterData[];
};

export type CalloutPollProps = {
  title?: string;
  options: PollOptionData[];
  selectedOptionIds: string[];
  isSingleChoice: boolean;
  isClosed: boolean;
  canVote: boolean;
  showResults: boolean;
  showTotalOnly: boolean;
  resultsDetail: 'full' | 'count' | 'percentage';
  totalVotes?: number;
  hasVoted: boolean;
  isAnonymous: boolean;
  showAddCustomOption: boolean;
  isAddingCustomOption: boolean;
  onSubmitCustomOption?: (text: string) => void;
  onChange: (selectedIds: string[]) => void;
  onRemoveVote?: () => void;
  statusMessage?: string;
  statusProgress?: number;
  errorMessage?: string;
  warningMessage?: string;
  className?: string;
};

// --- Sub-components ---

const CUSTOM_OPTION_SENTINEL = '__custom__';

function OptionLabel({
  option,
  showResults,
  resultsDetail,
}: {
  option: PollOptionData;
  showResults: boolean;
  resultsDetail: 'full' | 'count' | 'percentage';
}) {
  const showCount = showResults && option.voteCount != null && resultsDetail !== 'percentage';
  const showPercentage = showResults && option.votePercentage != null && resultsDetail !== 'count';
  const showBar = showResults && option.votePercentage != null;
  const showVoters = showResults && resultsDetail === 'full' && option.voters && option.voters.length > 0;
  const percentage = option.votePercentage ?? 0;

  return (
    <div className="relative flex-1 min-w-0 py-1 px-2 rounded overflow-hidden min-h-[40px] flex flex-col justify-center">
      {showBar && (
        <div
          className="absolute inset-y-0 left-0 bg-muted transition-all duration-400 rounded"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${option.text}: ${Math.round(percentage)}%`}
        />
      )}
      <div className="relative z-[1]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-body text-foreground">{option.text}</span>
          <span className="flex items-center gap-1 shrink-0 text-caption text-muted-foreground">
            {showPercentage && <span>{Math.round(option.votePercentage ?? 0)}%</span>}
            {showCount && <span>({option.voteCount})</span>}
          </span>
        </div>
        {showVoters && option.voters && <PollVoterAvatars voters={option.voters} className="mt-1" />}
      </div>
    </div>
  );
}

function CustomOptionRow({
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
}) {
  const { t } = useTranslation('crd-space');
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
      <button
        type="button"
        className="flex-1 min-w-0 py-2 text-left min-h-[40px] flex items-center"
        onClick={e => {
          e.preventDefault();
          onActivate();
        }}
      >
        <span className="text-caption text-muted-foreground">{t('poll.customOption.placeholder')}</span>
      </button>
    );
  }

  return (
    <div className="flex-1 min-w-0 py-1 flex items-center min-h-[40px]">
      <div className="flex items-center gap-1 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('poll.customOption.placeholder')}
          disabled={isLoading}
          maxLength={512}
          aria-label={t('poll.customOption.placeholder')}
          className="flex-1 h-8 px-2 border border-border rounded-md bg-background text-body focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onMouseDown={e => e.preventDefault()}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            handleSubmit();
          }}
          disabled={!isValid || isLoading}
          aria-label={t('forms.addOption')}
        >
          <Check className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onMouseDown={e => e.preventDefault()}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onDeactivate();
          }}
          disabled={isLoading}
          aria-label={t('a11y.close')}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// --- Main Component ---

export function CalloutPoll({
  title,
  options,
  selectedOptionIds,
  isSingleChoice,
  isClosed,
  canVote,
  showResults,
  showTotalOnly,
  resultsDetail,
  totalVotes,
  hasVoted,
  isAnonymous,
  showAddCustomOption,
  isAddingCustomOption,
  onSubmitCustomOption,
  onChange,
  onRemoveVote,
  statusMessage,
  statusProgress,
  errorMessage,
  warningMessage,
  className,
}: CalloutPollProps) {
  const { t } = useTranslation('crd-space');
  const [customOptionActive, setCustomOptionActive] = useState(false);

  const handleCustomOptionSubmit = (text: string) => {
    onSubmitCustomOption?.(text);
    setCustomOptionActive(false);
  };

  // Single-choice: RadioGroup
  if (isSingleChoice) {
    const radioValue = customOptionActive ? CUSTOM_OPTION_SENTINEL : (selectedOptionIds[0] ?? '');

    return (
      <div className={cn('space-y-3', className)}>
        {title && (
          <div className="flex items-center justify-between">
            <span className="text-body-emphasis text-foreground">{title}</span>
            {showTotalOnly && totalVotes != null && (
              <span className="text-caption text-muted-foreground">
                {t('poll.results.totalVotes', { count: totalVotes })}
              </span>
            )}
          </div>
        )}

        <RadioGroup
          value={radioValue}
          onValueChange={value => {
            if (value === CUSTOM_OPTION_SENTINEL) {
              setCustomOptionActive(true);
            } else {
              setCustomOptionActive(false);
              onChange([value]);
            }
          }}
          disabled={isClosed || !canVote}
          className="gap-0"
          aria-label={title}
        >
          {options.map(option => (
            <label key={option.id} className="flex items-start gap-3 cursor-pointer py-1">
              <RadioGroupItem value={option.id} className="mt-2.5" />
              <OptionLabel option={option} showResults={showResults} resultsDetail={resultsDetail} />
            </label>
          ))}
          {showAddCustomOption && (
            <div className="flex items-start gap-3 cursor-pointer py-1">
              <RadioGroupItem value={CUSTOM_OPTION_SENTINEL} className="mt-2.5" />
              <CustomOptionRow
                isActive={customOptionActive}
                onActivate={() => setCustomOptionActive(true)}
                onDeactivate={() => setCustomOptionActive(false)}
                onSubmit={handleCustomOptionSubmit}
                isLoading={isAddingCustomOption}
              />
            </div>
          )}
        </RadioGroup>

        <PollFooter
          statusMessage={statusMessage}
          statusProgress={statusProgress}
          hasVoted={hasVoted}
          isClosed={isClosed}
          isAnonymous={isAnonymous}
          showResults={showResults}
          showTotalOnly={showTotalOnly}
          totalVotes={totalVotes}
          onRemoveVote={onRemoveVote}
          errorMessage={errorMessage}
          warningMessage={warningMessage}
          loading={!!statusMessage}
        />
      </div>
    );
  }

  // Multi-choice: Checkboxes
  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedOptionIds, optionId]);
    } else {
      onChange(selectedOptionIds.filter(id => id !== optionId));
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <span className="text-body-emphasis text-foreground">{title}</span>
          {showTotalOnly && totalVotes != null && (
            <span className="text-caption text-muted-foreground">
              {t('poll.results.totalVotes', { count: totalVotes })}
            </span>
          )}
        </div>
      )}

      <fieldset disabled={isClosed || !canVote} aria-label={title}>
        <div className="space-y-0">
          {options.map(option => {
            const isSelected = selectedOptionIds.includes(option.id);

            return (
              <label key={option.id} className="flex items-start gap-3 cursor-pointer py-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={checked => handleCheckboxChange(option.id, checked === true)}
                  className="mt-2.5"
                />
                <OptionLabel option={option} showResults={showResults} resultsDetail={resultsDetail} />
              </label>
            );
          })}
          {showAddCustomOption && (
            <div className="flex items-start gap-3 cursor-pointer py-1">
              <Checkbox
                checked={customOptionActive}
                onCheckedChange={checked => {
                  if (checked) {
                    setCustomOptionActive(true);
                  } else {
                    setCustomOptionActive(false);
                  }
                }}
                className="mt-2.5"
              />
              <CustomOptionRow
                isActive={customOptionActive}
                onActivate={() => setCustomOptionActive(true)}
                onDeactivate={() => setCustomOptionActive(false)}
                onSubmit={handleCustomOptionSubmit}
                isLoading={isAddingCustomOption}
              />
            </div>
          )}
        </div>
      </fieldset>

      <PollFooter
        statusMessage={statusMessage}
        statusProgress={statusProgress}
        hasVoted={hasVoted}
        isClosed={isClosed}
        isAnonymous={isAnonymous}
        showResults={showResults}
        showTotalOnly={showTotalOnly}
        totalVotes={totalVotes}
        onRemoveVote={onRemoveVote}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        loading={!!statusMessage}
      />
    </div>
  );
}

// --- Footer ---

function PollFooter({
  statusMessage,
  statusProgress,
  hasVoted,
  isClosed,
  isAnonymous,
  showResults,
  showTotalOnly,
  totalVotes,
  onRemoveVote,
  errorMessage,
  warningMessage,
  loading,
}: {
  statusMessage?: string;
  statusProgress?: number;
  hasVoted: boolean;
  isClosed: boolean;
  isAnonymous: boolean;
  showResults: boolean;
  showTotalOnly: boolean;
  totalVotes?: number;
  onRemoveVote?: () => void;
  errorMessage?: string;
  warningMessage?: string;
  loading: boolean;
}) {
  const { t } = useTranslation('crd-space');

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 justify-between flex-wrap">
        {statusMessage && (
          <output className="flex items-center gap-2">
            {statusProgress != null ? (
              <Progress value={statusProgress} className="w-3 h-3" />
            ) : (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
            <span className="text-caption text-muted-foreground">{statusMessage}</span>
          </output>
        )}
        {!loading && hasVoted && !isClosed && onRemoveVote && (
          <span className="text-caption text-muted-foreground">
            {t('poll.status.voted')}{' '}
            <button
              type="button"
              className="text-caption text-primary hover:underline cursor-pointer"
              onClick={onRemoveVote}
            >
              {t('poll.status.removeMyVote')}
            </button>
          </span>
        )}
        {isClosed && <span className="text-caption text-muted-foreground">{t('poll.status.closed')}</span>}
        {isAnonymous && <span className="text-caption text-muted-foreground">{t('poll.status.anonymous')}</span>}
      </div>

      {!showResults && !showTotalOnly && totalVotes === 0 && (
        <p className="text-caption text-muted-foreground text-center py-2">{t('poll.results.noVotes')}</p>
      )}

      {warningMessage && <p className="text-caption text-amber-600">{warningMessage}</p>}

      {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
    </div>
  );
}
