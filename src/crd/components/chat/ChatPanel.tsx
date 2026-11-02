import { ChevronLeft, Maximize2, Minimize2, Settings, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { cn } from '@/crd/lib/utils';

type ChatPanelProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  /** When provided, a back affordance is shown in the header (thread view). */
  onBack?: () => void;
  /** Required: these buttons are icon-only, so an empty aria-label would leave them
   * with no accessible name (WCAG 2.1 AA 4.1.2). Mandatory labels make that unrepresentable. */
  backLabel: string;
  /** When provided, a shortcut to the notification (sound) settings is shown in the header. */
  onGoToSettings?: () => void;
  settingsLabel: string;
  /** Labels of the expand / collapse toggle (desktop only). */
  expandLabel: string;
  collapseLabel: string;
  /** Conversation identity (avatar) rendered between the back affordance and the title. */
  titleAvatar?: ReactNode;
  /** When provided, the avatar and title become one button that calls this (e.g. open the chat's settings). */
  onTitleClick?: () => void;
  /** What the title button does, appended to its accessible name after the title. */
  titleActionLabel?: string;
  /** Conversation-specific actions (e.g. group/guidance menu) shown in the header. */
  headerActions?: ReactNode;
  children: ReactNode;
};

const ICON_BUTTON_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The floating card shell for the unified chat. Anchored above the launcher on
 * desktop, where it can be expanded to a large centered window and collapsed
 * back; full-screen on small screens. Provides a sticky header and a scroll-free
 * body region — each child view (list / thread) owns its own scrollable area via
 * the `flex-1 min-h-0 overflow-y-auto` pattern.
 *
 * Non-modal in every mode: focus is not trapped. While the panel covers the
 * page (expanded, or full-screen on a small screen) the page itself does not
 * scroll behind it; expanded, the page is dimmed like behind any other dialog,
 * and a click on the dimmed page collapses the panel again.
 */
export function ChatPanel({
  open,
  title,
  onClose,
  closeLabel,
  onBack,
  backLabel,
  onGoToSettings,
  settingsLabel,
  expandLabel,
  collapseLabel,
  titleAvatar,
  onTitleClick,
  titleActionLabel,
  headerActions,
  children,
}: ChatPanelProps) {
  const { isSmallScreen } = useScreenSize();
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded && !isSmallScreen;
  const coversPage = open && (isSmallScreen || isExpanded);

  useEffect(() => {
    if (!coversPage) {
      return;
    }
    // Lock on <body>, as Radix overlays do: a lock on <html> stops body overflow
    // reaching the viewport, so a dialog's own body lock would reset the page scroll.
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [coversPage]);

  if (!open) {
    return null;
  }

  const titleContent = (
    <>
      {titleAvatar && (
        <span aria-hidden="true" className="shrink-0">
          {titleAvatar}
        </span>
      )}
      <span className="text-subsection-title min-w-0 flex-1 truncate px-1">{title}</span>
    </>
  );

  return (
    <>
      {isExpanded && (
        <div
          aria-hidden="true"
          data-slot="chat-backdrop"
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setExpanded(false)}
        />
      )}
      <div
        role="dialog"
        aria-label={title}
        data-expanded={isExpanded}
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden bg-card text-card-foreground shadow-xl',
          isSmallScreen
            ? 'inset-0 rounded-none'
            : isExpanded
              ? 'left-1/2 top-1/2 h-[min(800px,calc(100vh-4rem))] w-[min(960px,calc(100vw-10rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border'
              : 'bottom-24 right-4 h-[600px] max-h-[calc(100vh-7rem)] w-[380px] rounded-xl border border-border'
        )}
      >
        <header className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-2">
          {onBack && (
            <button type="button" onClick={onBack} aria-label={backLabel} className={ICON_BUTTON_CLASS}>
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
          )}
          {onTitleClick ? (
            <button
              type="button"
              onClick={onTitleClick}
              className="flex min-w-0 flex-1 items-center gap-1 rounded-md text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {titleContent}
              {titleActionLabel && <span className="sr-only">, {titleActionLabel}</span>}
            </button>
          ) : (
            titleContent
          )}
          {headerActions}
          {!isSmallScreen && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-label={isExpanded ? collapseLabel : expandLabel}
              aria-expanded={isExpanded}
              className={ICON_BUTTON_CLASS}
            >
              {isExpanded ? (
                <Minimize2 aria-hidden="true" className="size-4" />
              ) : (
                <Maximize2 aria-hidden="true" className="size-4" />
              )}
            </button>
          )}
          {onGoToSettings && (
            <button type="button" onClick={onGoToSettings} aria-label={settingsLabel} className={ICON_BUTTON_CLASS}>
              <Settings aria-hidden="true" className="size-5" />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label={closeLabel} className={ICON_BUTTON_CLASS}>
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </>
  );
}
