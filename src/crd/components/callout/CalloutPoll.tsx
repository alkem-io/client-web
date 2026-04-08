import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type PollOption = {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  isSelected: boolean;
};

type CalloutPollProps = {
  question: string;
  options: PollOption[];
  canVote: boolean;
  onVote: (optionId: string) => void;
  className?: string;
};

export function CalloutPoll({ question, options, canVote, onVote, className }: CalloutPollProps) {
  const { t } = useTranslation('crd-space');
  const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0);

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="text-sm font-semibold text-foreground">{question}</h4>

      <div className="space-y-2">
        {options.map(option => (
          <div key={option.id} className="relative">
            {canVote ? (
              <Button
                variant={option.isSelected ? 'default' : 'outline'}
                className="w-full justify-between text-sm h-auto py-3 px-4"
                onClick={() => onVote(option.id)}
              >
                <span>{option.text}</span>
                <span className="text-xs opacity-70">{option.voteCount}</span>
              </Button>
            ) : (
              <div className="relative border border-border rounded-lg py-3 px-4 overflow-hidden">
                {/* Progress bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-300"
                  style={{ width: `${option.percentage}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <span className={cn('text-sm', option.isSelected && 'font-semibold text-primary')}>
                    {option.text}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {option.percentage}% ({option.voteCount})
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{t('callout.totalVotes', { count: totalVotes })}</p>
    </div>
  );
}
