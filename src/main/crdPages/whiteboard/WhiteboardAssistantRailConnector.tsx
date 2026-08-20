import { lazy, Suspense, useEffect, useRef } from 'react';
import { AssistantRailFrame } from '@/crd/components/whiteboard/AssistantRailFrame';
import { useAssistantContext } from '@/main/assistant/AssistantContext';
import { useAssistantEnabled } from '@/main/assistant/useAssistantEnabled';

// Lazy import so the MUI assistant body is a SEPARATE async chunk, fetched only
// when the rail first opens — keeping MUI out of the CRD whiteboard route chunk.
const AssistantPanelContent = lazy(() => import('@/main/assistant/AssistantPanelContent'));

/**
 * Bridges the (CRD-pure) whiteboard editor to the (MUI) assistant panel. It holds
 * NO MUI itself: it reads the assistant context and renders the docked rail ONLY
 * when the assistant is open AND scoped to THIS whiteboard. Because the global
 * dialog renders the same AssistantPanelContent only when there is NO whiteboard
 * scope, exactly one instance is ever mounted (single conversation store).
 */
export function WhiteboardAssistantRailConnector({ whiteboardId }: { whiteboardId: string }) {
  const isEnabled = useAssistantEnabled();
  const { isOpen, setIsOpen, panelContext, clearPanelContext } = useAssistantContext();
  const railOpen = isEnabled && isOpen && panelContext?.whiteboardId === whiteboardId;

  // Read the latest "scoped to this board" + actions at unmount time without
  // re-running the cleanup on every render (clearPanelContext is a fresh closure
  // each render). Same refs-mirror pattern as useAssistantRehydrate.
  const scopedHereRef = useRef(false);
  scopedHereRef.current = isEnabled && panelContext?.whiteboardId === whiteboardId;
  const actionsRef = useRef({ setIsOpen, clearPanelContext });
  actionsRef.current = { setIsOpen, clearPanelContext };

  useEffect(() => {
    return () => {
      // The whiteboard editor unmounted (board closed). If the assistant was
      // scoped to THIS board, reset the open state + scope so neither the global
      // panel nor a later board inherits a stale "open, scoped to a gone board".
      if (scopedHereRef.current) {
        actionsRef.current.setIsOpen(false);
        actionsRef.current.clearPanelContext();
      }
    };
  }, []);

  return (
    <AssistantRailFrame open={railOpen}>
      {railOpen && (
        <Suspense fallback={null}>
          <AssistantPanelContent isOpen={railOpen} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </AssistantRailFrame>
  );
}
