import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type ToolActivityPart, ToolActivityStatus } from './types';

/**
 * Human-readable indication of a tool being used, e.g. "Searching whiteboards…"
 * with started/finished/error status (FR-004). The `label` is server-provided
 * (browser-assistant-sse.md `tool-activity` payload) — the browser holds no
 * tool logic; it only renders the label and status.
 */
export const AssistantToolActivity = ({ part }: { part: ToolActivityPart }) => {
  const { t } = useTranslation();

  const icon =
    part.status === ToolActivityStatus.Finished ? (
      <CircleCheck className="size-4 shrink-0 text-green-600" aria-hidden={true} />
    ) : part.status === ToolActivityStatus.Error ? (
      <CircleX className="size-4 shrink-0 text-destructive" aria-hidden={true} />
    ) : (
      <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden={true} />
    );

  const text =
    part.status === ToolActivityStatus.Error
      ? t('assistant.toolActivity.error', { label: part.label })
      : part.status === ToolActivityStatus.Finished
        ? t('assistant.toolActivity.finished', { label: part.label })
        : t('assistant.toolActivity.started', { label: part.label });

  return (
    // <output> carries an implicit role="status" so assistive tech announces the tool step.
    <output className="flex items-center gap-2">
      {icon}
      <span className="text-caption text-muted-foreground">{text}</span>
    </output>
  );
};
