import React, { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchResult } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import { last } from 'lodash';
import { Message } from './models/message';
import { MID_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import MessageView from './MessageView';
import PostMessageToCommentsForm from './PostMessageToCommentsForm';
import ScrollerWithGradient from '../../../../core/ui/overflow/ScrollerWithGradient';
import Gutters from '../../../../core/ui/grid/Gutters';
import { CaptionSmall } from '../../../../core/ui/typography';

const COMMENTS_CONTAINER_HEIGHT = 400;
const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface CommentsComponentProps {
  messages: Message[] | undefined;
  commentsId: string | undefined;
  canReadMessages: boolean;
  canPostMessages: boolean;
  canDeleteMessage: (messageId: string) => boolean;
  handlePostMessage: (commentsId: string, message: string) => Promise<FetchResult<unknown>> | void;
  handleDeleteMessage: (commentsId: string, messageId: string) => void;
  loading?: boolean;
  last?: boolean;
  onClickMore?: () => void;
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

const CommentsComponent: FC<CommentsComponentProps> = ({
  last: isShowingLastMessage,
  messages = [],
  commentsId,
  handlePostMessage,
  handleDeleteMessage,
  canPostMessages,
  canDeleteMessage,
  loading,
  onClickMore,
}) => {
  const { t } = useTranslation();

  const commentsContainerRef = useRef<HTMLElement>(null);
  const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
  const wasScrolledToBottomRef = useRef(true);

  const onPostComment = (message: string) => (commentsId ? handlePostMessage(commentsId, message) : undefined);
  const onDeleteComment = (id: string) => (commentsId ? handleDeleteMessage(commentsId, id) : undefined);

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
  }, [messages, containerHeight]);

  useEffect(() => {
    if (wasScrolledToBottomRef.current && commentsContainerRef.current) {
      scroller.scrollToBottom({ container: commentsContainerRef.current });
    }
  }, [messages]);

  const handleScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  const lastMessage = last(messages);

  return (
    <>
      {!isShowingLastMessage && (
        <ScrollerWithGradient
          maxHeight={COMMENTS_CONTAINER_HEIGHT}
          minHeight={0}
          flexGrow={1}
          scrollerRef={commentsContainerRef}
          onScroll={handleScroll}
        >
          <Gutters>
            {messages.map(message => (
              <MessageView
                key={message.id}
                message={message}
                canDelete={canDeleteMessage(message.id)}
                onDelete={onDeleteComment}
              />
            ))}
          </Gutters>
        </ScrollerWithGradient>
      )}
      {isShowingLastMessage && lastMessage && (
        <>
          <CaptionSmall onClick={onClickMore}>{t('callout.contributions', { count: messages.length })}</CaptionSmall>
          <MessageView
            key={lastMessage.id}
            message={lastMessage}
            canDelete={canDeleteMessage(lastMessage.id)}
            onDelete={onDeleteComment}
          />
          <CaptionSmall textAlign="center" onClick={onClickMore}>
            {t('common.show-all')}
          </CaptionSmall>
        </>
      )}
      {canPostMessages && (
        <PostMessageToCommentsForm
          placeholder={t('pages.aspect.dashboard.comment.placeholder')}
          onPostComment={onPostComment}
          maxLength={MID_TEXT_LENGTH}
          disabled={loading}
        />
      )}
      {!canPostMessages && (
        <Box paddingY={1} display="flex" justifyContent="center">
          <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
        </Box>
      )}
    </>
  );
};

export default CommentsComponent;
