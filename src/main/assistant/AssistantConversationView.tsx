import { Alert, Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { gutters } from '@/core/ui/grid/utils';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
import { AssistantConfirmation } from './AssistantConfirmation';
import { useAssistantContext } from './AssistantContext';
import { AssistantTextPart } from './AssistantTextPart';
import { AssistantToolActivity } from './AssistantToolActivity';
import { AssistantErrorCode, type AssistantMessage, type ConfirmationPart, type MessagePart } from './types';
import { useAssistantConversation } from './useAssistantConversation';

/**
 * Renders the single rolling conversation: ordered message parts per turn.
 * - `text` → streamed markdown (throttled re-parse).
 * - `tool-activity` → human-readable "Searching…" with status (FR-004).
 * - `tool-result` → optional inline result summary.
 * - `confirmation` → the itemized write proposal with a single Approve / Decline
 *   control (US2 / FR-015); the still-pending proposal is actionable, a
 *   superseded/resolved one is rendered with the control disabled.
 *
 * A turn-level `error` renders a clear, non-blocking message; for
 * `permission_denied` (the wire code surfaced when a write capability is disabled
 * in the user's grant) it links to Settings → Assistant (US2 / FR-018).
 * Clarifying questions are NORMAL text turns and never reach this error UI (T013).
 */
export const AssistantConversationView = () => {
  const { t } = useTranslation();
  const { state } = useAssistantContext();
  const { submitConfirmationDecision } = useAssistantConversation();

  const handleDecision = (proposedWriteSetId: string, decision: 'approve' | 'decline') => {
    void submitConfirmationDecision(proposedWriteSetId, decision);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={gutters(1)}
      padding={gutters(1)}
      sx={{ overflowY: 'auto', flexGrow: 1 }}
      // A conversation log: announce only newly-added content (not the whole
      // growing buffer on every token), and flag busy while a turn streams (T031).
      role="log"
      aria-label={t('assistant.title')}
      aria-live="polite"
      aria-relevant="additions"
      aria-busy={state.isStreaming}
    >
      {state.messages.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {t('assistant.intro')}
        </Typography>
      )}

      {state.messages.map(message => (
        <AssistantMessageView
          key={message.id}
          message={message}
          streaming={state.isStreaming}
          pendingConfirmationId={state.pendingConfirmationId}
          onDecision={handleDecision}
        />
      ))}

      {state.isStreaming && state.messages.length > 0 && (
        <Typography variant="caption" color="text.secondary" role="status">
          {t('assistant.thinking')}
        </Typography>
      )}

      {state.error && (
        <Box role="alert">
          <AssistantErrorAlert code={state.error.code} message={state.error.message} />
        </Box>
      )}
    </Box>
  );
};

/**
 * The turn-level error UI. For `permission_denied` (which is also the wire code
 * surfaced when a write capability is disabled in the user's grant — there is no
 * distinct `capability_disabled` wire code, browser-assistant-sse.md) we add a
 * hint linking to Settings → Assistant (US2 / FR-018). `session_invalid`
 * (incl. an expired/invalid approval) reads "please re-ask".
 */
const AssistantErrorAlert = ({ code, message }: { code: AssistantErrorCode; message: string }) => {
  const { t } = useTranslation();
  const { userModel } = useCurrentUserContext();
  const settingsUrl = buildSettingsTabUrl(userModel?.profile?.url, 'assistant');

  return (
    <Alert severity="error" variant="outlined">
      <Box display="flex" flexDirection="column" gap={gutters(0.25)}>
        <Typography variant="body2">{message || t(`assistant.errors.${code}` as const)}</Typography>
        {code === AssistantErrorCode.PermissionDenied && settingsUrl && (
          <Link component={RouterLink} to={settingsUrl} variant="caption">
            {t('assistant.confirmation.enableCapabilityLink')}
          </Link>
        )}
      </Box>
    </Alert>
  );
};

const AssistantMessageView = ({
  message,
  streaming,
  pendingConfirmationId,
  onDecision,
}: {
  message: AssistantMessage;
  streaming: boolean;
  pendingConfirmationId: string | null;
  onDecision: (proposedWriteSetId: string, decision: 'approve' | 'decline') => void;
}) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={gutters(0.5)}
      // Announce who authored the turn (T031) without a visual label.
      role="group"
      aria-label={isUser ? t('assistant.a11y.userTurn') : t('assistant.a11y.assistantTurn')}
      sx={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
      }}
    >
      {message.parts.map((part, index) => (
        <AssistantPartView
          key={partKey(message.id, part, index)}
          part={part}
          streaming={streaming}
          pendingConfirmationId={pendingConfirmationId}
          onDecision={onDecision}
        />
      ))}
    </Box>
  );
};

const AssistantPartView = ({
  part,
  streaming,
  pendingConfirmationId,
  onDecision,
}: {
  part: MessagePart;
  streaming: boolean;
  pendingConfirmationId: string | null;
  onDecision: (proposedWriteSetId: string, decision: 'approve' | 'decline') => void;
}) => {
  switch (part.type) {
    case 'text':
      return <AssistantTextPart text={part.text} streaming={streaming} />;
    case 'tool-activity':
      return <AssistantToolActivity part={part} />;
    case 'tool-result':
      return (
        <Typography variant="caption" color="text.secondary">
          {part.summary}
        </Typography>
      );
    case 'confirmation':
      return (
        <ConfirmationPartView
          part={part}
          // Only the still-pending proposal is actionable; a superseded/resolved
          // one is rendered but its control disabled (e.g. an already-approved
          // set or a rehydrated set whose stream has since ended).
          actionable={pendingConfirmationId === part.proposedWriteSetId}
          streaming={streaming}
          onDecision={onDecision}
        />
      );
    default:
      return null;
  }
};

const ConfirmationPartView = ({
  part,
  actionable,
  streaming,
  onDecision,
}: {
  part: ConfirmationPart;
  actionable: boolean;
  streaming: boolean;
  onDecision: (proposedWriteSetId: string, decision: 'approve' | 'decline') => void;
}) => (
  <AssistantConfirmation
    part={part}
    disabled={!actionable || streaming}
    onApprove={() => onDecision(part.proposedWriteSetId, 'approve')}
    onDecline={() => onDecision(part.proposedWriteSetId, 'decline')}
  />
);

function partKey(messageId: string, part: MessagePart, index: number): string {
  if (part.type === 'tool-activity' || part.type === 'tool-result') {
    return `${messageId}-${part.toolActionId}`;
  }
  if (part.type === 'confirmation') {
    return `${messageId}-${part.proposedWriteSetId}`;
  }
  return `${messageId}-${index}`;
}
