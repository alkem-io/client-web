import type { ReactNode } from 'react';
import type { CommentsWithMessagesModel } from '@/domain/communication/room/models/CommentsWithMessagesModel';
import { useCrdRoomComments } from '../hooks/useCrdRoomComments';

type CalendarCommentsConnectorProps = {
  roomId: string;
  /** Pre-loaded room data from useCalendarEventDetail. */
  room: CommentsWithMessagesModel | undefined;
  children: (slots: { thread: ReactNode; commentInput: ReactNode | null; commentCount: number }) => ReactNode;
};

/**
 * Thin wrapper around `useCrdRoomComments`. The calendar room is already
 * loaded by `useCalendarEventDetail` so there's no lazy-load gating; we
 * always subscribe (skipSubscription defaults to false).
 */
export function CalendarCommentsConnector({ roomId, room, children }: CalendarCommentsConnectorProps) {
  const slots = useCrdRoomComments({ roomId, room });
  return <>{children(slots)}</>;
}
