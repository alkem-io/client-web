import { useEffect, useRef, useState, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { FetchResult } from '@apollo/client';
import { last } from 'lodash';
import { Message } from '../models/Message';
import { animateScroll as scroller } from 'react-scroll';
import { useResizeDetector } from 'react-resize-detector';
import MessageView from './MessageView';
import PostMessageToCommentsForm from './PostMessageToCommentsForm';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import Gutters from '@/core/ui/grid/Gutters';
import { CaptionSmall } from '@/core/ui/typography';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import useCommentReactionsMutations from './useCommentReactionsMutations';
import MessagesThread from './MessagesThread';
import { gutters } from '@/core/ui/grid/utils';
import { CommentInputFieldProps } from './CommentInputField';
import CalloutClosedMarginal from '@/domain/collaboration/callout/calloutBlock/CalloutClosedMarginal';
import { Box, BoxProps } from '@mui/material';

const SCROLL_BOTTOM_MISTAKE_TOLERANCE = 10;

export interface CommentsComponentProps {
  messages: Message[] | undefined;
  vcInteractions: CommentInputFieldProps['vcInteractions'];
  commentsId: string | undefined;
  canReadMessages: boolean;
  canPostMessages: boolean;
  isMember?: boolean;
  canAddReaction: boolean;
  canDeleteMessage: (authorId: string | undefined) => boolean;
  postMessage: (message: string) => Promise<FetchResult<unknown>> | void;
  postReply: (reply: { messageText: string; threadId: string }) => void;
  handleDeleteMessage: (commentsId: string, messageId: string) => void;
  maxHeight?: BoxProps['maxHeight'];
  height?: BoxProps['height'];
  fullHeight?: boolean;
  loading?: boolean;
  last?: boolean;
  onClickMore?: () => void;
  commentsEnabled: boolean;
  externalScrollRef?: RefObject<HTMLElement | null>;
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
  return Math.abs(scrollHeight - containerHeight - scrollTop) < SCROLL_BOTTOM_MISTAKE_TOLERANCE;
};

const CommentsComponent = ({
  last: isShowingLastMessage,
  messages = [],
  vcInteractions = [],
  commentsId,
  postMessage,
  postReply,
  handleDeleteMessage,
  canPostMessages,
  isMember = false,
  canDeleteMessage,
  canAddReaction,
  maxHeight,
  height,
  fullHeight,
  loading,
  onClickMore,
  commentsEnabled,
  externalScrollRef,
}: CommentsComponentProps) => {
  const { t } = useTranslation();

  const internalCommentsContainerRef = useRef<HTMLElement>(null);
  const commentsContainerRef = externalScrollRef || internalCommentsContainerRef;
  const prevScrollTopRef = useRef<ScrollState>({ scrollTop: 0, scrollHeight: 0 });
  const wasScrolledToBottomRef = useRef(true);
  const [commentToBeDeleted, setCommentToBeDeleted] = useState<string | undefined>(undefined);

  const handleDeleteComment = (id: string) => (commentsId ? handleDeleteMessage(commentsId, id) : undefined);
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
  }, [messages, containerHeight]);

  useEffect(() => {
    if (wasScrolledToBottomRef.current && commentsContainerRef.current) {
      scroller.scrollToBottom({ container: commentsContainerRef.current });
    }
  }, [messages]);

  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      commentsContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [commentsContainerRef.current]);

  const commentReactionsMutations = useCommentReactionsMutations(commentsId);

  const handleScroll = () => {
    prevScrollTopRef.current.scrollTop = commentsContainerRef.current!.scrollTop;
  };

  const lastMessage = last(messages);

  const hasMessages = messages.length > 0;

  return (
    <>
      {!isShowingLastMessage && hasMessages && (
        <ScrollerWithGradient
          maxHeight={maxHeight}
          height={height}
          scrollerRef={internalCommentsContainerRef}
          margin={0}
        >
          <Gutters gap={0}>
            <MessagesThread
              messages={messages}
              vcInteractions={vcInteractions}
              loading={loading}
              canPostMessages={canPostMessages}
              onReply={postReply}
              canDeleteMessage={canDeleteMessage}
              onDeleteMessage={onDeleteComment}
              canAddReaction={canAddReaction}
              {...commentReactionsMutations}
            />
          </Gutters>
        </ScrollerWithGradient>
      )}
      {isShowingLastMessage && lastMessage && (
        <>
          <CaptionSmall onClick={onClickMore}>
            {t('callout.contributions.contributionsCount', { count: messages.length })}
          </CaptionSmall>
          <MessageView
            key={lastMessage.id}
            message={lastMessage}
            canDelete={canDeleteMessage(lastMessage.author?.id)}
            onDelete={onDeleteComment}
            canAddReaction={canAddReaction}
            {...commentReactionsMutations}
          />
          <CaptionSmall textAlign="center" onClick={onClickMore}>
            {t('common.show-all')}
          </CaptionSmall>
        </>
      )}
      {!hasMessages && fullHeight && <Box flex={1} />}
      {canPostMessages && (
        <PostMessageToCommentsForm
          placeholder={t('pages.post.dashboard.comment.placeholder')}
          onPostComment={postMessage}
          disabled={loading}
          padding={gutters()}
          paddingBottom={0}
        />
      )}
      {!canPostMessages && (
        <CalloutClosedMarginal messagesCount={messages?.length ?? 0} disabled={!commentsEnabled} isMember={isMember} />
      )}
      <ConfirmationDialog
        actions={{
          onCancel: () => setCommentToBeDeleted(undefined),
          onConfirm: async () => {
            if (commentToBeDeleted) {
              await handleDeleteComment(commentToBeDeleted);
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
    </>
  );
};

export default CommentsComponent;
