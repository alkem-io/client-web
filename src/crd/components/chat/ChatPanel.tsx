import { ChevronLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';

type ChatPanelProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  /** When provided, a back affordance is shown in the header (thread view). */
  onBack?: () => void;
  backLabel?: string;
  /** Conversation-specific actions (e.g. group/guidance menu) shown in the header. */
  headerActions?: ReactNode;
  children: ReactNode;
};

/**
 * The floating card shell for the unified chat. Anchored above the launcher on
 * desktop; expands to full-screen on small screens. Provides a sticky header and
 * a scroll-free body region — each child view (list / thread) owns its own
 * scrollable area via the `flex-1 min-h-0 overflow-y-auto` pattern.
 */
export function ChatPanel({
  open,
  title,
  onClose,
  closeLabel,
  onBack,
  backLabel,
  headerActions,
  children,
}: ChatPanelProps) {
  const { isSmallScreen } = useScreenSize();

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden bg-card text-card-foreground shadow-xl',
        isSmallScreen
          ? 'inset-0 rounded-none'
          : 'bottom-24 right-4 h-[600px] max-h-[calc(100vh-7rem)] w-[380px] rounded-xl border border-border'
      )}
    >
      <header className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel ?? ''}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
        )}
        <span className="text-subsection-title min-w-0 flex-1 truncate px-1">{title}</span>
        {headerActions}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
