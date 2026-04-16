import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { EventDetailView } from '@/crd/components/space/timeline/EventDetailView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import useCalendarEventDetail from '@/domain/timeline/calendar/useCalendarEventDetail';
import { mapCalendarEventDetailsToDetailData } from '../dataMappers/calendarEventDataMapper';
import { useCrdSpaceLocale } from '../hooks/useCrdSpaceLocale';
import { CalendarCommentsConnector } from './CalendarCommentsConnector';

type EventDetailConnectorProps = {
  eventId: string;
  /** Wired by the parent dialog connector; same callback powers the header
   *  Back action and the not-found back button. */
  onBack: () => void;
};

/**
 * Bridges the `useCalendarEventDetail` domain hook to the CRD `EventDetailView`.
 * Owns the comments connector composition so the view receives fully-rendered
 * slots; the view itself remains free of Apollo.
 */
export function EventDetailConnector({ eventId, onBack }: EventDetailConnectorProps) {
  const { event, loading } = useCalendarEventDetail({ eventId });
  const locale = useCrdSpaceLocale();

  const notFound = !loading && !event;
  const detailData = mapCalendarEventDetailsToDetailData(event, { loading, notFound });

  const commentsRoom = event?.comments;
  const canReadComments = commentsRoom?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;

  // Optimisation: skip mounting <CalendarCommentsConnector> entirely when the
  // user has no Read permission on the room. This avoids the room subscription
  // and post/react/delete mutation hooks being wired up for a UI surface they
  // can't see. useCrdRoomComments does NOT also gate on Read internally — its
  // inner gate is canComment (CreateMessage permission), not Read.
  if (!commentsRoom || !canReadComments) {
    return (
      <EventDetailView
        event={detailData}
        showComments={false}
        onBack={onBack}
        resolveColor={pickColorFromId}
        locale={locale}
      />
    );
  }

  return (
    <CalendarCommentsConnector roomId={commentsRoom.id} room={commentsRoom}>
      {({ thread, commentInput, commentCount }) => (
        <EventDetailView
          event={detailData}
          showComments={true}
          commentCount={commentCount}
          commentsSlot={thread}
          commentInputSlot={commentInput}
          onBack={onBack}
          resolveColor={pickColorFromId}
          locale={locale}
        />
      )}
    </CalendarCommentsConnector>
  );
}
