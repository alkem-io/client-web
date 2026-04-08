import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Plus, Trash2, BarChart3 } from 'lucide-react';

type PollOptionsEditorProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  questionError?: string;
  options: string[];
  onOptionsChange: (options: string[]) => void;
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
    if (options.length < 10) {
      onOptionsChange([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      onOptionsChange(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    onOptionsChange(updated);
  };

  return (
    <div className={cn('space-y-3 p-4 border rounded-xl bg-muted/30', className)}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium">{t('callout.poll')}</span>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">{t('forms.pollQuestion')}</label>
        <input
          type="text"
          value={question}
          onChange={e => onQuestionChange(e.target.value)}
          placeholder={t('forms.pollQuestion')}
          className={cn(
            'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
            questionError ? 'border-destructive' : 'border-border'
          )}
          aria-label={t('forms.pollQuestion')}
        />
        {questionError && <p className="text-xs text-destructive">{questionError}</p>}
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={option}
              onChange={e => updateOption(index, e.target.value)}
              placeholder={t('forms.pollOption', { number: index + 1 })}
              className="flex-1 h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t('forms.pollOption', { number: index + 1 })}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeOption(index)}
                aria-label="Remove option"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {options.length < 10 && (
        <Button variant="outline" size="sm" className="gap-2" onClick={addOption}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('forms.addOption')}
        </Button>
      )}
    </div>
  );
}
