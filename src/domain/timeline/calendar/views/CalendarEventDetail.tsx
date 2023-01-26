import AspectDashboardView from '../../../collaboration/aspect/views/AspectDashboardView';
import CalendarEventDetailContainer from '../CalendarEventDetailContainer';


interface CalendarEventDetailProps {
  hubNameId: string;
  eventId: string | undefined;
}

const CalendarEventDetail = ({ hubNameId, eventId }: CalendarEventDetailProps) => {

  return (
    <CalendarEventDetailContainer hubNameId={hubNameId} eventId={eventId}>
      {({ event, messages, commentsId, ...rest }) => (
        <AspectDashboardView
          mode="messages"
          displayName={event?.displayName}
          description={event?.profile?.description}
          type={event?.type}
          tags={event?.profile?.tagset?.tags}
          references={event?.profile?.references}
          messages={messages}
          commentId={event?.comments?.id}
          aspectUrl=""
          {...rest}
        />
      )}
    </CalendarEventDetailContainer>
  );
};

export default CalendarEventDetail;
