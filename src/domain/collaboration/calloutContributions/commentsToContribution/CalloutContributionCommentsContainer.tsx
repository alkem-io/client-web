import { useMessages } from '@/domain/communication/room/Comments/useMessages';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCallback, useMemo } from 'react';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import {
  useCalloutContributionCommentsQuery,
  useRemoveMessageOnRoomMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';

import { Message } from '@/domain/communication/room/models/Message';
import { CommentInputFieldProps } from '@/domain/communication/room/Comments/CommentInputField';
import { FetchResult } from '@apollo/client';
import usePostMessageMutations from '@/domain/communication/room/Comments/usePostMessageMutations';
import { SimpleContainerProps } from '@/core/container/SimpleContainer';
import useSubscribeOnRoomEvents from '../../callout/useSubscribeOnRoomEvents';
import { Identifiable } from '@/core/utils/Identifiable';

export interface CalloutContributionCommentsContainerProps
  extends SimpleContainerProps<CalloutContributionCommentsContainerProvided> {
  callout: {
    settings: {
      contribution: {
        commentsEnabled: boolean;
      };
    };
  };
  contribution:
    | (Identifiable & {
        post?: Identifiable;
        whiteboard?: Identifiable;
        link?: Identifiable;
        memo?: Identifiable;
      })
    | undefined;
}

interface CalloutContributionCommentsContainerProvided {
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
  loading: boolean;
  posting: boolean;
}

const CalloutContributionCommentsContainer = ({
  callout,
  contribution,
  children,
}: CalloutContributionCommentsContainerProps) => {
  const { userModel, isAuthenticated } = useCurrentUserContext();

  const { data, loading } = useCalloutContributionCommentsQuery({
    variables: {
      contributionId: contribution?.id!,
      includePost: !!contribution?.post,
      // Only comments on Posts implemented for now
      // includeWhiteboard: !!contribution?.whiteboard,
      // includeLink: !!contribution?.link,
      // includeMemo: !!contribution?.memo,
    },
    skip: !contribution?.id,
  });

  const room = data?.lookup.contribution?.post?.comments; // || data?.lookup.contribution?.whiteboard?.comments || data?.lookup.contribution?.link?.comments || data?.lookup.contribution?.memo?.comments;

  const commentsId = room?.id;
  const fetchedMessages = useMemo(() => room?.messages ?? [], [room]);
  const messages = useMessages(fetchedMessages);

  const commentsPrivileges = room?.authorization?.myPrivileges ?? [];
  const canDeleteMessages = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
  const canDeleteMessage = useCallback(
    authorId => canDeleteMessages || (isAuthenticated && authorId === userModel?.id),
    [userModel, isAuthenticated, canDeleteMessages]
  );

  const canReadMessages = commentsPrivileges.includes(AuthorizationPrivilege.Read);
  const commentsEnabled = callout?.settings.contribution.commentsEnabled ?? false;
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
        vcInteractions: room?.vcInteractions ?? [],
        canReadMessages,
        commentsEnabled,
        canPostMessages,
        postMessage,
        postReply,
        canDeleteMessage,
        handleDeleteMessage,
        canAddReaction,
        loading: loading,
        posting: postingMessage || postingReply || deletingMessage,
      })}
    </>
  );
};

export default CalloutContributionCommentsContainer;
