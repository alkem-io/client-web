import type { ReactNode } from 'react';
import { cn } from '@/crd/lib/utils';

/**
 * Docked right-hand rail container for the in-whiteboard assistant. Pure CRD
 * chrome (Tailwind only, no MUI): a fixed-width column that sits as a flex
 * SIBLING of the Excalidraw canvas inside WhiteboardEditorShell, so opening it
 * shrinks the canvas (push layout) instead of overlaying it. Renders nothing when
 * closed, letting the canvas reclaim the width. The hosted panel supplies its own
 * header/close, so this frame is intentionally headerless.
 */
export function AssistantRailFrame({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!open) {
    return null;
  }
  return (
    <aside
      className={cn(
        'shrink-0 w-[380px] max-w-[40vw] h-full border-l border-border bg-background flex flex-col',
        className
      )}
    >
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </aside>
  );
}
