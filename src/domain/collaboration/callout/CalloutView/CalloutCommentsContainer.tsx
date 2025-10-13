import { useMessages } from '@/domain/communication/room/Comments/useMessages';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCallback, useMemo } from 'react';
import { CalloutLayoutProps } from '../calloutBlock/CalloutLayoutTypes';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useRemoveMessageOnRoomMutation } from '@/core/apollo/generated/apollo-hooks';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import useSubscribeOnRoomEvents from '../useSubscribeOnRoomEvents';
import { Message } from '@/domain/communication/room/models/Message';
import { CommentInputFieldProps } from '@/domain/communication/room/Comments/CommentInputField';
import { FetchResult } from '@apollo/client';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';

interface CalloutCommentsContainerProps extends SimpleContainerProps<CalloutCommentsContainerProvided> {
  callout: CalloutLayoutProps['callout'] | undefined;
}

interface CalloutCommentsContainerProvided {
  commentsId: string | undefined;
  messages: Message[] | undefined;
  vcInteractions: CommentInputFieldProps['vcInteractions'];
  canReadMessages: boolean;
  commentsEnabled: boolean;
  canPostMessages: boolean;
  canAddReaction: boolean;
  canDeleteMessage: (authorId: string | undefined) => boolean;
  postMessage: (message: string) => Promise<FetchResult<unknown>>;
  postReply: (reply: { messageText: string; threadId: string }) => void;
  handleDeleteMessage: (commentsId: string, messageId: string) => void;
  loading?: boolean;
}

const CalloutCommentsContainer = ({ callout, children }: CalloutCommentsContainerProps) => {
  const { userModel, isAuthenticated } = useCurrentUserContext();
  const commentsId = callout?.comments?.id;
  const fetchedMessages = useMemo(() => callout?.comments?.messages ?? [], [callout]);
  const messages = useMessages(fetchedMessages);

  const commentsPrivileges = callout?.comments?.authorization?.myPrivileges ?? [];
  const canDeleteMessages = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteMessage = useCallback(
    authorId => canDeleteMessages || (isAuthenticated && authorId === userModel?.id),
    [userModel, isAuthenticated, canDeleteMessages]
  );

  const canReadMessages = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const commentsEnabled = callout?.settings.framing.commentsEnabled ?? false;
  const canPostMessages = commentsEnabled && commentsPrivileges.includes(AuthorizationPrivilege.CreateMessage);
  const canAddReaction = commentsPrivileges.includes(AuthorizationPrivilege.CreateMessageReaction);

  const [deleteMessage, { loading: deletingMessage }] = useRemoveMessageOnRoomMutation({
    update: (cache, { data }) =>
      data?.removeMessageOnRoom && evictFromCache(cache, String(data.removeMessageOnRoom), 'Message'),
  });

  const isSubscribedToComments = useSubscribeOnRoomEvents(commentsId);

  const handleDeleteMessage = (commentsId: string, messageId: string) =>
    deleteMessage({
      variables: {
        messageData: {
          roomID: commentsId,
          messageID: messageId,
        },
      },
    });

  const { postMessage, postReply, postingMessage, postingReply } = usePostMessageMutations({
    roomId: commentsId,
    isSubscribedToMessages: isSubscribedToComments,
  });

  return (
    <>
      {children({
        commentsId,
        messages,
        vcInteractions: callout?.comments?.vcInteractions ?? [],
        canReadMessages,
        commentsEnabled,
        canPostMessages,
        postMessage,
        postReply,
        canDeleteMessage,
        handleDeleteMessage,
        canAddReaction,
        loading: postingMessage || postingReply || deletingMessage,
      })}
    </>
  );
};

export default CalloutCommentsContainer;
