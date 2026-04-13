import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BarChart3, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Switch } from '@/crd/primitives/switch';

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 10;

export type PollOptionValue = {
  id?: string;
  text: string;
};

type PollOptionsEditorProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  questionError?: string;
  options: PollOptionValue[];
  onOptionsChange: (options: PollOptionValue[]) => void;
  settingsSlot?: ReactNode;
  pollStatus?: 'open' | 'closed';
  onStatusChange?: (status: 'open' | 'closed') => void;
  isClosed?: boolean;
  className?: string;
};

function SortableOptionRow({
  id,
  index,
  option,
  canRemove,
  onRemove,
  onTextChange,
  disabled,
}: {
  id: string;
  index: number;
  option: PollOptionValue;
  canRemove: boolean;
  onRemove: () => void;
  onTextChange: (text: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation('crd-space');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn('flex items-center gap-2', isDragging && 'opacity-50 z-10')}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        disabled={disabled}
        className="shrink-0 text-muted-foreground hover:text-foreground cursor-grab disabled:cursor-default disabled:opacity-50 touch-none"
        aria-label={t('pollForm.dragHandle')}
      >
        <GripVertical className="w-4 h-4" aria-hidden="true" />
      </button>
      <input
        type="text"
        value={option.text}
        onChange={e => onTextChange(e.target.value)}
        placeholder={t('forms.pollOption', { number: index + 1 })}
        disabled={disabled}
        maxLength={512}
        className="flex-1 h-9 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('forms.pollOption', { number: index + 1 })}
      />
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          disabled={disabled}
          aria-label={t('forms.removeOption')}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export function PollOptionsEditor({
  question,
  onQuestionChange,
  questionError,
  options,
  onOptionsChange,
  settingsSlot,
  pollStatus,
  onStatusChange,
  isClosed = false,
  className,
}: PollOptionsEditorProps) {
  const { t } = useTranslation('crd-space');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const itemIds = options.map((option, index) => option.id ?? `new-${index}`);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...options];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onOptionsChange(reordered);
  };

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
          disabled={isClosed}
          className={cn(
            'w-full h-9 px-3 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed',
            questionError ? 'border-destructive' : 'border-border'
          )}
        />
        {questionError && <p className="text-xs text-destructive">{questionError}</p>}
      </div>

      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {options.map((option, index) => (
              <SortableOptionRow
                key={itemIds[index]}
                id={itemIds[index]}
                index={index}
                option={option}
                canRemove={options.length > MIN_POLL_OPTIONS}
                onRemove={() => removeOption(index)}
                onTextChange={text => updateOption(index, text)}
                disabled={isClosed}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {!isClosed && options.length < MAX_POLL_OPTIONS && (
            <Button variant="outline" size="sm" className="gap-2" onClick={addOption}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('forms.addOption')}
            </Button>
          )}
          {isClosed && <span className="text-xs text-muted-foreground">{t('poll.status.closed')}</span>}
        </div>

        <div className="flex items-center gap-2">
          {pollStatus && onStatusChange && (
            <div className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
              <Switch
                checked={pollStatus === 'open'}
                onCheckedChange={checked => onStatusChange(checked ? 'open' : 'closed')}
                aria-label={pollStatus === 'open' ? t('pollForm.openPoll') : t('pollForm.closePoll')}
              />
              {pollStatus === 'open' ? t('pollForm.openPoll') : t('pollForm.closePoll')}
            </div>
          )}
          {settingsSlot}
        </div>
      </div>
    </div>
  );
}
