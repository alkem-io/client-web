import { FocusScope } from '@radix-ui/react-focus-scope';
import { Send, Settings, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { Textarea } from '@/crd/primitives/textarea';
import AssistantBudgetMeter from './AssistantBudgetMeter';
import { useAssistantContext } from './AssistantContext';
import { AssistantConversationView } from './AssistantConversationView';
import AssistantNewConversationButton from './AssistantNewConversationButton';
import AssistantSettingsDialog from './AssistantSettingsDialog';
import { useAssistantBudget } from './useAssistantBudget';
import { useAssistantConversation } from './useAssistantConversation';
import { useAssistantRehydrate } from './useAssistantRehydrate';

/**
 * The assistant panel body (header + conversation + composer + settings), shared
 * by the two shells that host it: the global dialog (AssistantDialog) and the
 * whiteboard-docked rail (WhiteboardAssistantRailConnector → AssistantRailFrame).
 *
 * It owns the conversation transport hooks (useAssistantConversation /
 * useAssistantRehydrate), so EXACTLY ONE instance may be mounted at a time — the
 * two shells are mutually exclusive on `panelContext` (null → dialog, set → rail).
 * `onClose` is injected so each shell decides what "close" means; the panel-level
 * teardown (abort the in-flight turn + drop the per-turn whiteboard scope) lives
 * here so both shells share it.
 *
 * Default-exported so the CRD whiteboard layer can `React.lazy()` it.
 */
type AssistantPanelContentProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AssistantPanelContent = ({ isOpen, onClose }: AssistantPanelContentProps) => {
  const { t } = useTranslation();
  const { state, panelContext, clearPanelContext } = useAssistantContext();
  const { sendMessage, cancel, isStreaming, startNewConversation } = useAssistantConversation();
  const [draft, setDraft] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Rehydrate the single rolling thread on open/reload (incl. a pending
  // confirmation) and reconnect an in-flight turn (US3 / FR-011).
  useAssistantRehydrate();

  // Read-only monthly usage meter (D1 / T049). The initial snapshot is fetched
  // while the panel is open; it then stays live off the `monthToDateUsed` pushed
  // in each `done` SSE event (B), preferred over the initial fetch so the meter
  // updates per turn without a refetch. Hides itself when the asvc endpoint is
  // absent (404) or fails.
  const { budget } = useAssistantBudget(isOpen);
  const liveBudget =
    budget && state.monthToDateUsed !== null ? { ...budget, monthToDateUsed: state.monthToDateUsed } : budget;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Excalidraw aggressively reclaims focus when the panel opens over a whiteboard,
  // so autoFocus alone doesn't stick. Nudge focus to the input once the panel has
  // mounted/animated so the user can type immediately.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  // Abort any in-flight stream if a host unmounts the panel without going through
  // the explicit close control (rail collapsed, board closed, dialog backdrop
  // dismissed). `cancel` reads a stable ref, so the empty-deps capture is safe.
  useEffect(() => () => cancel(), []);

  const handleSend = () => {
    const content = draft;
    setDraft('');
    void sendMessage(content);
  };

  const handleClose = () => {
    cancel();
    // Drop the per-turn whiteboard scope so it never leaks into a later
    // globally-opened panel, then let the host collapse/close its shell.
    clearPanelContext();
    onClose();
  };

  return (
    <FocusScope
      // The whiteboard editor is a Radix-modal dialog whose own FocusScope keeps
      // reclaiming the keyboard for the Excalidraw canvas. A Radix scope only
      // pauses for ANOTHER Radix scope, so trapping here pauses the whiteboard's
      // trap and keeps the input focusable. Stays trapped even while the settings
      // dialog is open — that dialog mounts its OWN FocusScope on top of the stack,
      // so the whiteboard never momentarily reclaims focus during the transition.
      trapped={true}
      loop={true}
      onMountAutoFocus={event => event.preventDefault()}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}
    >
      <div className="flex items-center justify-between border-b border-border p-2">
        <div>
          <h2 id="assistant-dialog-title" className="text-section-title">
            {t('assistant.title')}
          </h2>
          {panelContext?.displayName && (
            <span className="text-caption text-muted-foreground">
              {t('assistant.scopedTo', { name: panelContext.displayName })}
            </span>
          )}
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('assistant.settings')}
          >
            <Settings aria-hidden={true} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label={t('assistant.closeButton')}>
            <X aria-hidden={true} />
          </Button>
        </div>
      </div>

      <AssistantBudgetMeter budget={liveBudget} />

      <AssistantConversationView />

      <div className="flex items-center gap-2 border-t border-border p-2">
        <AssistantNewConversationButton onClick={() => void startNewConversation()} />
        <Textarea
          ref={inputRef}
          autoFocus={true}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('assistant.inputPlaceholder')}
          aria-label={t('assistant.inputPlaceholder')}
          rows={1}
          className="max-h-36 min-h-9 flex-1"
        />
        {isStreaming ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={cancel}
            aria-label={t('assistant.stop')}
            className="text-primary"
          >
            <Square aria-hidden={true} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSend}
            aria-label={t('assistant.send')}
            disabled={!draft.trim()}
            className="text-primary"
          >
            <Send aria-hidden={true} />
          </Button>
        )}
      </div>

      <AssistantSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        scope={panelContext ? 'whiteboard' : 'all'}
      />
    </FocusScope>
  );
};

export default AssistantPanelContent;
