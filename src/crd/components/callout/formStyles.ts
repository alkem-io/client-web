import { cn } from '@/crd/lib/utils';

/** Shared look of the Form surfaces (fill-in and response views): one card per question. */
export const formQuestionCardClass = 'space-y-3 rounded-[12px] border border-border bg-muted/40 p-4';

export const formQuestionPromptClass = 'flex gap-1.5 text-body-emphasis text-foreground';

export const formOptionRowClass = (selected: boolean, interactive: boolean) =>
  cn(
    'flex min-h-10 items-center gap-3 rounded-[8px] border px-3 py-2 text-body text-foreground transition-colors',
    selected ? 'border-primary bg-muted/40' : 'border-border bg-card',
    interactive ? 'cursor-pointer' : 'cursor-default',
    interactive && !selected && 'hover:bg-muted/40'
  );
