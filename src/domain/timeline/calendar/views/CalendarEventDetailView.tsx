import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import PostMessageToCommentsForm from '@/domain/communication/room/Comments/PostMessageToCommentsForm';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '@/domain/shared/components/References/References';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import Gutters from '@/core/ui/grid/Gutters';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import MessagesThread from '@/domain/communication/room/Comments/MessagesThread';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockBanner from '@/core/ui/content/PageContentBlockBanner';
import { BlockSectionTitle } from '@/core/ui/typography';
import EventCardHeader from './EventCardHeader';
import useCalendarEvent from './useCalendarEvent';

const COMMENTS_CONTAINER_HEIGHT = 400;
const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface CalendarEventDetailViewProps {
  eventId: string | undefined;
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
}

const isScrolledToBottom = ({
  scrollTop,
  scrollHeight,
  containerHeight,
}: ScrollState & { containerHeight: number }) => {
  // Due to a bug with the zoom in Chromium based browsers we can not check if scrollTop === (scrollHeight - containerHeight)
  // This will return true if scrollTop is approximately equal to (scrollHeight - containerHeight), if the comments are scrolled very close to the end
  return Math.abs(scrollHeight - containerHeight - scrollTop) < SCROLL_BOTTOM_MISTAKE_TOLERANCE;
};

const CalendarEventDetailView = ({ eventId }: CalendarEventDetailViewProps) => {
  const { t } = useTranslation();
  const {
    loading: { loading },
    actions,
    event,
    permissions,
    comments,
  } = useCalendarEvent({
    eventId,
  });

  const commentsContainerRef = useRef<HTMLElement>(null);
  const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
  const wasScrolledToBottomRef = useRef(true);
  const [commentToBeDeleted, setCommentToBeDeleted] = useState<string | undefined>(undefined);

  const deleteComment = (id: string) => (comments.roomId ? actions.deleteMessage(comments.roomId, id) : undefined);
  const onDeleteComment = (id: string) => setCommentToBeDeleted(id);

  const { height: containerHeight = 0 } = useResizeDetector({
    targetRef: commentsContainerRef,
  });

  useEffect(() => {
    if (commentsContainerRef.current) {
      wasScrolledToBottomRef.current = isScrolledToBottom({ ...prevScrollTopRef.current, containerHeight });

      prevScrollTopRef.current = {
        scrollTop: commentsContainerRef.current.scrollTop,
        scrollHeight: commentsContainerRef.current.scrollHeight,
      };
    }
  }, [comments, containerHeight]);

  useEffect(() => {
    if (wasScrolledToBottomRef.current && commentsContainerRef.current) {
      scroller.scrollToBottom({ container: commentsContainerRef.current });
    }
  }, [comments]);

  const commentReactionsMutations = useCommentReactionsMutations(comments.roomId);

  const handleCommentsScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  return (
    <PageContentBlock sx={{ flexDirection: 'row' }}>
      <PageContentColumn columns={6}>
        <PageContentBlock>
          <PageContentBlockBanner bannerUrl={event?.profile.banner?.uri}>
            <EventCardHeader event={event} />
          </PageContentBlockBanner>
          {loading ? (
            <>
              <Skeleton width={'80%'} />
              <Skeleton width={'70%'} />
              <Skeleton width={'60%'} />
            </>
          ) : (
            <Gutters>
              <WrapperMarkdown>{event?.profile.description ?? ''}</WrapperMarkdown>
              <TagsComponent tags={event?.profile.tagset?.tags ?? []} loading={loading} />
            </Gutters>
          )}
        </PageContentBlock>
        <References references={event?.profile.references} />
      </PageContentColumn>
      {permissions.canReadComments && (
        <PageContentColumn columns={6}>
          <PageContentBlock title={`${t('common.comments')} (${comments.messages.length})`}>
            <ScrollerWithGradient
              maxHeight={COMMENTS_CONTAINER_HEIGHT}
              minHeight={0}
              marginRight={1}
              flexGrow={1}
              scrollerRef={commentsContainerRef}
              onScroll={handleCommentsScroll}
            >
              <Gutters gap={0}>
                <MessagesThread
                  messages={comments.messages}
                  vcInteractions={comments.vcInteractions}
                  vcEnabled={false}
                  canPostMessages={permissions.canPostComments}
                  onReply={actions.postReply}
                  canDeleteMessage={permissions.canDeleteComment}
                  onDeleteMessage={onDeleteComment}
                  canAddReaction={permissions.canAddReaction}
                  sortOrder="asc"
                  {...commentReactionsMutations}
                />
              </Gutters>
            </ScrollerWithGradient>
            <Box>
              {permissions.canPostComments && (
                <PostMessageToCommentsForm
                  vcEnabled={false}
                  placeholder={t('pages.post.dashboard.comment.placeholder')}
                  onPostComment={actions.postMessage}
                />
              )}
              {!permissions.canPostComments && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <BlockSectionTitle>{t('components.discussion.cant-post')}</BlockSectionTitle>
                </Box>
              )}
            </Box>
          </PageContentBlock>
          <ConfirmationDialog
            actions={{
              onCancel: () => setCommentToBeDeleted(undefined),
              onConfirm: async () => {
                if (commentToBeDeleted) {
                  await deleteComment(commentToBeDeleted);
                }
                setCommentToBeDeleted(undefined);
              },
            }}
            entities={{
              confirmButtonTextId: 'buttons.delete',
              contentId: 'components.confirmation-dialog.delete-comment.confirmation-text',
              titleId: 'components.confirmation-dialog.delete-comment.confirmation-title',
            }}
            options={{
              show: Boolean(commentToBeDeleted),
            }}
          />
        </PageContentColumn>
      )}
    </PageContentBlock>
  );
};

export default CalendarEventDetailView;
