import type { ChainedCommands, Editor } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/crd/lib/utils';

type ToolbarButtonProps = {
  editor: Editor;
  icon: LucideIcon;
  label: string;
  command: (chain: ChainedCommands) => ChainedCommands;
  isActive?: string | [string, Record<string, unknown>];
  disabled?: boolean;
  className?: string;
};

export function ToolbarButton({
  editor,
  icon: Icon,
  label,
  command,
  isActive: activeSpec,
  disabled: disabledProp,
  className,
}: ToolbarButtonProps) {
  const [, setTick] = useState(0);

  // Guard: editor.view getter throws if the editor isn't mounted yet.
  let isEditorReady = false;
  try {
    isEditorReady = !!editor.view?.dom;
  } catch {
    // editor.view threw — editor not mounted yet
  }

  // Refresh state on every editor transaction
  useEffect(() => {
    if (!isEditorReady) return;
    const handler = () => setTick(t => t + 1);
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor, isEditorReady]);

  if (!isEditorReady) {
    return (
      <button
        type="button"
        className={cn(
          'h-8 w-8 inline-flex items-center justify-center rounded-md opacity-40 pointer-events-none',
          className
        )}
        disabled={true}
        aria-label={label}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
      </button>
    );
  }

  const active = activeSpec
    ? Array.isArray(activeSpec)
      ? editor.isActive(activeSpec[0], activeSpec[1])
      : editor.isActive(activeSpec)
    : false;

  const canRun = !disabledProp && command(editor.can().chain().focus()).run();
  const isDisabled = disabledProp || !canRun;

  return (
    <button
      type="button"
      className={cn(
        'h-8 w-8 inline-flex items-center justify-center rounded-md transition-colors shrink-0',
        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        isDisabled && 'opacity-40 pointer-events-none',
        className
      )}
      onClick={() => command(editor.chain().focus()).run()}
      disabled={isDisabled}
      aria-label={label}
      aria-pressed={activeSpec ? active : undefined}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
