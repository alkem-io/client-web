import { Skeleton } from '@mui/material';
import { sortBy, uniq } from 'lodash';
import { useMemo } from 'react';
import { CalendarEvent, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import AspectDashboardView from '../../../collaboration/aspect/views/AspectDashboardView';
import { useAuthorsDetails } from '../../../communication/communication/useAuthorsDetails';
import { Message } from '../../../shared/components/Comments/models/message';

type NeededFields =
  | 'id'
  | 'nameID'
  | 'displayName'
  | 'profile'
  | 'type'
  | 'startDate'
  | 'durationMinutes'
  | 'wholeDay'
  | 'multipleDays'
  | 'comments';
export type CalendarEventDetailData = Pick<CalendarEvent, NeededFields> & {
  bannerNarrow?: VisualUriFragment;
  createdBy: { displayName: string };
  createdDate: string | Date; // Apollo says Date while actually it's a string
};
interface CalendarEventDetailProps {
  event: CalendarEventDetailData | undefined;
}

const CalendarEventDetail = ({ event }: CalendarEventDetailProps) => {
  /*
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (messageId: string) => boolean;
  banner?: string;
  displayName?: string;
  description?: string;
  type?: string;
  messages?: Message[];
  commentId?: string;
  tags?: string[];
  references?: Pick<Reference, 'id' | 'name' | 'uri' | 'description'>[];
  creatorAvatar?: string;
  creatorName?: string;
  createdDate?: string;
  handlePostComment: (commentId: string, message: string) => Promise<FetchResult<unknown>> | void;
  handleDeleteComment: (commentId: string, messageId: string) => void;
  aspectUrl: string;
  loading: boolean;
  error?: ApolloError;
*/
  const messages = event?.comments?.messages;
  const senders = useMemo(() => {
    if (!messages) return [];
    return uniq([...(messages?.map(m => m.sender.id) || [])]);
  }, [messages]);
  const { getAuthor, loading: loadingAuthors } = useAuthorsDetails(senders);
  const sortedMessages = useMemo(
    () =>
      sortBy(messages ?? [], message => message.timestamp).map<Message>(message => ({
        id: message.id,
        body: message.message,
        author: getAuthor(message.sender.id),
        createdAt: new Date(message.timestamp),
      })),
    [messages, getAuthor]
  );

  if (!event) return <Skeleton />;

  return (
    <AspectDashboardView
      mode="messages"
      displayName={event?.displayName}
      description={event?.profile?.description}
      type={event?.type}
      tags={event?.profile?.tagset?.tags}
      references={event?.profile?.references}
      messages={sortedMessages}
      commentId={event.comments?.id}
      canReadComments
      canPostComments
      canDeleteComment={() => true}
      handlePostComment={() => {}}
      handleDeleteComment={() => {}}
      aspectUrl=""
      loading={loadingAuthors}
    />
  );
};

export default CalendarEventDetail;
