import { type ChainedCommands, type Editor, useEditorState } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { isEditorReady } from './isEditorReady';

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
  const ready = isEditorReady(editor);

  // Subscribe to selection/transaction changes so the active highlight and
  // disabled state reflect the current cursor position.
  const state = useEditorState({
    editor: ready ? editor : null,
    selector: ({ editor: ed }) => {
      if (!ed) return { active: false, canRun: false };
      const active = activeSpec
        ? Array.isArray(activeSpec)
          ? ed.isActive(activeSpec[0], activeSpec[1])
          : ed.isActive(activeSpec)
        : false;
      let canRun = false;
      try {
        canRun = command(ed.can().chain().focus()).run();
      } catch {
        canRun = false;
      }
      return { active, canRun };
    },
  });

  if (!ready) {
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

  const active = state?.active ?? false;
  const isDisabled = disabledProp || !state?.canRun;

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
