import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchResult } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import DashboardGenericSection from '../DashboardSections/DashboardGenericSection';
import { Comment } from './models/comment';
import { MID_TEXT_LENGTH } from '../../../../models/constants/field-length.constants';
import { mapWithSeparator } from '../../utils/joinNodes';
import SectionSpacer from '../Section/SectionSpacer';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import MessageView from './MessageView';
import PostMessageToCommentsForm from './PostMessageToCommentsForm';

const COMMENTS_CONTAINER_HEIGHT = 400;
const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface CommentsComponentProps {
  messages: Comment[] | undefined;
  commentsId: string | undefined;
  canReadMessages: boolean;
  canPostMessages: boolean;
  canDeleteMessage: (messageId: string) => boolean;
  handlePostMessage: (commentsId: string, message: string) => Promise<FetchResult<unknown>> | void;
  handleDeleteMessage: (commentsId: string, messageId: string) => void;
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

  const { messages = [], commentsId, handlePostMessage, handleDeleteMessage } = props;
  const onPostComment = (message: string) => (commentsId ? handlePostMessage(commentsId, message) : undefined);
  const onDeleteComment = (id: string) => (commentsId ? handleDeleteMessage(commentsId, id) : undefined);

  const { canPostMessages, canDeleteMessage } = props;
  const { loading } = props;

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

  const handleScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  return (
    <DashboardGenericSection headerText={`${t('common.comments')} (${messages.length})`}>
      <Box
        sx={{ maxHeight: COMMENTS_CONTAINER_HEIGHT, overflowY: 'auto' }}
        ref={commentsContainerRef}
        onScroll={handleScroll}
      >
        {mapWithSeparator(messages, SectionSpacer, message => (
          <MessageView
            key={message.id}
            message={message}
            canDelete={canDeleteMessage(message.id)}
            onDelete={onDeleteComment}
          />
        ))}
      </Box>
      <SectionSpacer double />
      <Box>
        {canPostMessages && (
          <PostMessageToCommentsForm
            placeholder={t('pages.aspect.dashboard.comment.placeholder')}
            onPostComment={onPostComment}
            maxLength={MID_TEXT_LENGTH}
            disabled={loading}
          />
        )}
        {!canPostMessages && (
          <Box paddingY={4} display="flex" justifyContent="center">
            <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
          </Box>
        )}
      </Box>
    </DashboardGenericSection>
  );
};

export default CommentsComponent;
