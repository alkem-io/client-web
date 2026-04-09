import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;

export type PollOptionValue = {
  /** Server-assigned UUID when editing an existing poll; undefined for new options */
  id?: string;
  text: string;
};

type PollOptionsEditorProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  questionError?: string;
  options: PollOptionValue[];
  onOptionsChange: (options: PollOptionValue[]) => void;
  className?: string;
};

export function PollOptionsEditor({
  question,
  onQuestionChange,
  questionError,
  options,
  onOptionsChange,
  className,
}: PollOptionsEditorProps) {
  const { t } = useTranslation('crd-space');

  const addOption = () => {
    if (options.length < MAX_POLL_OPTIONS) {
      onOptionsChange([...options, { text: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_POLL_OPTIONS) {
      onOptionsChange(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], text };
    onOptionsChange(updated);
  };

  return (
    <div className={cn('space-y-3 p-4 border rounded-xl bg-muted/30', className)}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{t('callout.poll')}</span>
      </div>

      <div className="space-y-1">
        <label htmlFor="poll-question" className="text-xs text-muted-foreground">
          {t('forms.pollQuestion')}
        </label>
        <input
          id="poll-question"
          type="text"
          value={question}
          onChange={e => onQuestionChange(e.target.value)}
          placeholder={t('forms.pollQuestion')}
          className={cn(
            'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
            questionError ? 'border-destructive' : 'border-border'
          )}
        />
        {questionError && <p className="text-xs text-destructive">{questionError}</p>}
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id ?? `new-${index}`} className="flex items-center gap-2">
            <input
              type="text"
              value={option.text}
              onChange={e => updateOption(index, e.target.value)}
              placeholder={t('forms.pollOption', { number: index + 1 })}
              className="flex-1 h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t('forms.pollOption', { number: index + 1 })}
            />
            {options.length > MIN_POLL_OPTIONS && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeOption(index)}
                aria-label={t('forms.removeOption')}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {options.length < MAX_POLL_OPTIONS && (
        <Button variant="outline" size="sm" className="gap-2" onClick={addOption}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('forms.addOption')}
        </Button>
      )}
    </div>
  );
}
