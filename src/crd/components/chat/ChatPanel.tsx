import { FocusScope } from '@radix-ui/react-focus-scope';
import { ChevronLeft, Maximize2, Minimize2, Volume2, VolumeX, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RemoveScroll } from 'react-remove-scroll';
import {
  chatHeaderIconButtonClass,
  chatHeaderIconClass,
  chatHeaderLargeIconClass,
} from '@/crd/components/chat/CallControls';
import { useScreenSize } from '@/crd/hooks/useMediaQuery';
import { useVisibleViewportArea } from '@/crd/hooks/useVisibleViewportArea';
import { claimEscape } from '@/crd/lib/claimEscape';
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
  /** The settings control (e.g. a gear menu), shown in the header between the sound toggle and close. */
  settingsMenu?: ReactNode;
  /** When provided, a mute / unmute toggle for the chat sound is shown in the header. */
  onToggleSound?: () => void;
  /** Whether the chat sound is currently off. */
  soundMuted?: boolean;
  /** Names of the sound toggle: what a press does in each state. */
  muteSoundLabel: string;
  unmuteSoundLabel: string;
  /** Labels of the expand / collapse toggle (desktop only). */
  expandLabel: string;
  collapseLabel: string;
  /** Conversation identity (avatar) rendered between the back affordance and the title; mark its decorative parts aria-hidden. */
  titleAvatar?: ReactNode;
  /** When provided, the avatar and title become one button that calls this (e.g. open the chat's settings). */
  onTitleClick?: () => void;
  /** What the title button does, appended to its accessible name after the title. */
  titleActionLabel?: string;
  /** A line under the title in small muted text, truncated to one line. Not for use with onTitleClick when interactive. */
  subtitle?: ReactNode;
  /** Conversation-specific actions (e.g. group/guidance menu) shown in the header. */
  headerActions?: ReactNode;
  /** A status strip shown under the header, e.g. a connection notice. */
  notice?: ReactNode;
  children: ReactNode;
};

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
 *
 * Opened while a modal dialog is open (Message from inside the callout dialog),
 * the panel floats above that dialog and stays usable. It is portalled to the
 * end of <body>, so it paints above the dialog and is outside the dialog's
 * aria-hidden siblings; it takes pointer events back from the dialog's body lock;
 * its focus scope pauses the dialog's focus trap; its scroll lock replaces the
 * dialog's as the active one; and it carries the dialog's dismiss-ignore marker,
 * so presses in it do not dismiss the dialog. A dialog opened afterwards covers the panel in the same way.
 */
export function ChatPanel({
  open,
  title,
  onClose,
  closeLabel,
  onBack,
  backLabel,
  settingsMenu,
  onToggleSound,
  soundMuted = false,
  muteSoundLabel,
  unmuteSoundLabel,
  expandLabel,
  collapseLabel,
  titleAvatar,
  onTitleClick,
  titleActionLabel,
  subtitle,
  headerActions,
  notice,
  children,
}: ChatPanelProps) {
  const { isSmallScreen } = useScreenSize();
  const [expanded, setExpanded] = useState(false);
  const isExpanded = expanded && !isSmallScreen;
  const coversPage = open && (isSmallScreen || isExpanded);
  // Full screen on a phone: follow the visible area so the composer at the
  // bottom of the panel stays above the on-screen keyboard.
  const visibleArea = useVisibleViewportArea(open && isSmallScreen);

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

  // While the panel covers the page it is the topmost layer: Escape steps back
  // from a thread to the list, then closes. A dialog opened from inside the chat
  // is a Radix layer that handles Escape first, so the chat skips that press.
  // Listening on window lets document-level overlays opened above the chat
  // (search) claim Escape first. The floating card leaves Escape to the page.
  useEffect(() => {
    if (!coversPage) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (claimEscape(e)) {
        (onBack ?? onClose)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [coversPage, onBack, onClose]);

  if (!open) {
    return null;
  }

  const titleContent = (
    <>
      {titleAvatar && <span className="shrink-0">{titleAvatar}</span>}
      {subtitle ? (
        // Tighter line heights keep the two lines close to the height of a single-line header.
        <span className="flex min-w-0 flex-1 flex-col px-1">
          <span className="text-subsection-title truncate leading-6">{title}</span>
          <span className="flex min-w-0 text-caption leading-4 text-muted-foreground">{subtitle}</span>
        </span>
      ) : (
        <span className="text-subsection-title min-w-0 flex-1 truncate px-1">{title}</span>
      )}
    </>
  );

  return createPortal(
    <div data-dialog-dismiss-ignore="">
      {isExpanded && (
        <div
          aria-hidden="true"
          data-slot="chat-backdrop"
          className="pointer-events-auto fixed inset-0 z-50 bg-black/50"
          onClick={() => setExpanded(false)}
        />
      )}
      <FocusScope asChild={true} onMountAutoFocus={event => event.preventDefault()}>
        <RemoveScroll forwardProps={true} noIsolation={true} removeScrollBar={false}>
          <div
            role="dialog"
            aria-label={title}
            data-expanded={isExpanded}
            style={visibleArea ? { ...visibleArea, bottom: 'auto' } : undefined}
            className={cn(
              'pointer-events-auto fixed z-50 flex flex-col overflow-hidden bg-card text-card-foreground shadow-xl',
              isSmallScreen
                ? 'inset-0 rounded-none'
                : isExpanded
                  ? 'left-1/2 top-1/2 h-[min(800px,calc(100vh-4rem))] w-[min(960px,calc(100vw-10rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border'
                  : 'bottom-24 right-4 h-[600px] max-h-[calc(100vh-7rem)] w-[380px] rounded-xl border border-border'
            )}
          >
            <header className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-2">
              {onBack && (
                <button type="button" onClick={onBack} aria-label={backLabel} className={chatHeaderIconButtonClass}>
                  <ChevronLeft aria-hidden="true" className={chatHeaderLargeIconClass} />
                </button>
              )}
              {onTitleClick ? (
                <button
                  type="button"
                  onClick={onTitleClick}
                  className="flex min-w-8 flex-1 items-center gap-1 rounded-md text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  className={chatHeaderIconButtonClass}
                >
                  {isExpanded ? (
                    <Minimize2 aria-hidden="true" className={chatHeaderIconClass} />
                  ) : (
                    <Maximize2 aria-hidden="true" className={chatHeaderIconClass} />
                  )}
                </button>
              )}
              {onToggleSound && (
                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-label={soundMuted ? unmuteSoundLabel : muteSoundLabel}
                  className={chatHeaderIconButtonClass}
                >
                  {soundMuted ? (
                    <VolumeX aria-hidden="true" className={chatHeaderLargeIconClass} />
                  ) : (
                    <Volume2 aria-hidden="true" className={chatHeaderLargeIconClass} />
                  )}
                </button>
              )}
              {settingsMenu}
              <button type="button" onClick={onClose} aria-label={closeLabel} className={chatHeaderIconButtonClass}>
                <X aria-hidden="true" className={chatHeaderLargeIconClass} />
              </button>
            </header>
            {notice}
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </RemoveScroll>
      </FocusScope>
    </div>,
    document.body
  );
}
