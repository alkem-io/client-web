import { info, warn } from '@/core/logging/sentry/log';
import { TagCategoryValues } from '@/core/logging/sentry/log';

const EVENT_NAMESPACE = 'collaboration.guestAccess';

type GuestAccessEventPayload = {
  whiteboardId: string;
  nextState: boolean;
  reason?: string;
};

const formatLabel = (nextState: boolean) => (nextState ? 'enable' : 'disable');

export const trackGuestAccessToggleAttempt = ({ whiteboardId, nextState }: GuestAccessEventPayload) => {
  info(`${EVENT_NAMESPACE}.toggleAttempt`, {
    category: TagCategoryValues.WHITEBOARD,
    label: `${whiteboardId}:${formatLabel(nextState)}`,
  });
};

export const trackGuestAccessToggleSuccess = ({ whiteboardId, nextState }: GuestAccessEventPayload) => {
  info(`${EVENT_NAMESPACE}.toggleSuccess`, {
    category: TagCategoryValues.WHITEBOARD,
    label: `${whiteboardId}:${formatLabel(nextState)}`,
  });
};

export const trackGuestAccessToggleFailure = ({ whiteboardId, nextState, reason }: GuestAccessEventPayload) => {
  warn(`${EVENT_NAMESPACE}.toggleFailure`, {
    category: TagCategoryValues.WHITEBOARD,
    label: `${whiteboardId}:${formatLabel(nextState)}:${reason ?? 'unknown'}`,
    code: reason,
  });
};
