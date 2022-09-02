import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchResult } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { Comment } from '../../../../models/discussion/comment';
import { MID_TEXT_LENGTH } from '../../../../models/constants/field-length.constants';
import { mapWithSeparator } from '../../utils/joinNodes';
import SectionSpacer from '../Section/SectionSpacer';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import DiscussionComment from '../../../../common/components/composite/common/Discussion/DiscussionComment';
import PostComment from '../../../../common/components/composite/common/Discussion/PostComment';

const COMMENTS_CONTAINER_HEIGHT = 400;
const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface CommentsComponentProps {
  messages?: Comment[];
  commentsId?: string;
  canReadComments: boolean;
  canPostComments: boolean;
  canDeleteComment: (messageId: string) => boolean;
  handlePostComment: (commentsId: string, message: string) => Promise<FetchResult<unknown>> | void;
  handleDeleteComment: (commentsId: string, messageId: string) => void;
  loading?: boolean;
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

const CommentsComponent: FC<CommentsComponentProps> = props => {
  const { t } = useTranslation();

  const commentsContainerRef = useRef<HTMLElement>(null);
  const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
  const wasScrolledToBottomRef = useRef(true);

  const { messages = [], commentsId, handlePostComment, handleDeleteComment } = props;
  const onPostComment = (message: string) => (commentsId ? handlePostComment(commentsId, message) : undefined);
  const onDeleteComment = (id: string) => (commentsId ? handleDeleteComment(commentsId, id) : undefined);

  const { canPostComments, canDeleteComment } = props;

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
  }, [messages]);

  useEffect(() => {
    if (wasScrolledToBottomRef.current && commentsContainerRef.current) {
      scroller.scrollToBottom({ container: commentsContainerRef.current });
    }
  }, [messages]);

  const handleCommentsScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  return (
    <DashboardGenericSection headerText={`${t('common.comments')} (${messages.length})`}>
      <Box
        sx={{ maxHeight: COMMENTS_CONTAINER_HEIGHT, overflowY: 'auto' }}
        ref={commentsContainerRef}
        onScroll={handleCommentsScroll}
      >
        {mapWithSeparator(messages, SectionSpacer, comment => (
          <DiscussionComment
            key={comment.id}
            comment={comment}
            canDelete={canDeleteComment(comment.id)}
            onDelete={onDeleteComment}
          />
        ))}
      </Box>
      <SectionSpacer double />
      <Box>
        {canPostComments && (
          <PostComment
            placeholder={t('pages.aspect.dashboard.comment.placeholder')}
            onPostComment={onPostComment}
            maxLength={MID_TEXT_LENGTH}
          />
        )}
        {!canPostComments && (
          <Box paddingY={4} display="flex" justifyContent="center">
            <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
          </Box>
        )}
      </Box>
    </DashboardGenericSection>
  );
};

export default CommentsComponent;
