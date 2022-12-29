import CalloutLayout, { CalloutLayoutProps } from '../../CalloutBlock/CalloutLayout';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { CommentsWithMessagesFragmentWithCallout } from '../useCallouts';
import CommentsComponent from '../../../shared/components/Comments/CommentsComponent';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import { useUserContext } from '../../../community/contributor/user';
import {
  MessageDetailsFragmentDoc,
  usePostCommentInCalloutMutation,
  useRemoveCommentFromCalloutMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Message } from '../../../shared/components/Comments/models/message';
import { AuthorizationPrivilege, CalloutState } from '../../../../core/apollo/generated/graphql-schema';
import { evictFromCache } from '../../../shared/utils/apollo-cache/removeFromCache';
import { buildAuthorFromUser } from '../../../../common/utils/buildAuthorFromUser';
import { BaseCalloutImpl } from '../Types';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { Dialog, IconButton, useMediaQuery } from '@mui/material';
import { Close } from '@mui/icons-material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';

type NeededFields = 'id' | 'authorization' | 'messages' | 'calloutNameId';
export type CommentsCalloutData = Pick<CommentsWithMessagesFragmentWithCallout, NeededFields>;

interface CommentsCalloutProps extends BaseCalloutImpl {
  callout: CalloutLayoutProps['callout'] & {
    comments: CommentsCalloutData;
  };
  calloutNames: string[];
  isSubscribedToComments: boolean;
  loading?: boolean;
}

const COMMENTS_CONTAINER_HEIGHT = 400;

const CommentsCallout = forwardRef<HTMLDivElement, CommentsCalloutProps>(
  (
    {
      callout,
      calloutNames,
      loading,
      onCalloutEdit,
      onVisibilityChange,
      onCalloutDelete,
      isSubscribedToComments,
      contributionsCount,
    },
    ref
  ) => {
    const handleError = useApolloErrorHandler();
    const { user: userMetadata, isAuthenticated } = useUserContext();
    const user = userMetadata?.user;

    const commentsId = callout.comments.id;
    const _messages = useMemo(() => callout?.comments?.messages ?? [], [callout]);
    const messages = useMemo<Message[]>(
      () =>
        _messages?.map(x => ({
          id: x.id,
          body: x.message,
          author: x?.sender.id ? buildAuthorFromUser(x.sender) : undefined,
          createdAt: new Date(x.timestamp),
        })),
      [_messages]
    );

    const isAuthor = useCallback(
      (msgId: string, userId?: string) => messages.find(x => x.id === msgId)?.author?.id === userId ?? false,
      [messages]
    );

    const commentsPrivileges = callout?.comments?.authorization?.myPrivileges ?? [];
    const canDeleteMessages = commentsPrivileges.includes(AuthorizationPrivilege.Delete);
    const canDeleteMessage = useCallback(
      msgId => canDeleteMessages || (isAuthenticated && isAuthor(msgId, user?.id)),
      [user, isAuthenticated, isAuthor, canDeleteMessages]
    );

    const canReadMessages = commentsPrivileges.includes(AuthorizationPrivilege.Read);
    const canPostMessages =
      commentsPrivileges.includes(AuthorizationPrivilege.CreateComment) && callout.state !== CalloutState.Closed;

    const [deleteMessage, { loading: deletingMessage }] = useRemoveCommentFromCalloutMutation({
      onError: handleError,
      update: (cache, { data }) => data?.removeComment && evictFromCache(cache, String(data.removeComment), 'Message'),
    });

    const handleDeleteMessage = (commentsId: string, messageId: string) =>
      deleteMessage({
        variables: {
          messageData: {
            commentsID: commentsId,
            messageID: messageId,
          },
        },
      });

    const [postMessage, { loading: postingComment }] = usePostCommentInCalloutMutation({
      onError: handleError,
      update: (cache, { data }) => {
        if (isSubscribedToComments) {
          return;
        }

        const cacheCommentsId = cache.identify({
          id: commentsId,
          __typename: 'Comments',
        });

        if (!cacheCommentsId) {
          return;
        }

        cache.modify({
          id: cacheCommentsId,
          fields: {
            messages(existingMessages = []) {
              if (!data) {
                return existingMessages;
              }

              const newMessage = cache.writeFragment({
                data: data?.sendMessageOnCallout,
                fragment: MessageDetailsFragmentDoc,
                fragmentName: 'MessageDetails',
              });
              return [...existingMessages, newMessage];
            },
          },
        });
      },
    });

    const handlePostMessage = async (commentsId: string, message: string) =>
      postMessage({
        variables: {
          data: {
            calloutID: callout.id,
            message,
          },
        },
      });

    const breakpoint = useCurrentBreakpoint();

    const lastMessageOnly = breakpoint === 'xs';

    const [isFullViewDialogOpen, setIsFullViewDialogOpen] = useState(false);

    const canFitRegularDialog = useMediaQuery('@media only screen and (min-height: 600px)');

    return (
      <>
        <PageContentBlock ref={ref} disablePadding disableGap>
          <CalloutLayout
            callout={callout}
            calloutNames={calloutNames}
            contributionsCount={contributionsCount}
            onVisibilityChange={onVisibilityChange}
            onCalloutEdit={onCalloutEdit}
            onCalloutDelete={onCalloutDelete}
          >
            <CommentsComponent
              messages={messages}
              commentsId={commentsId}
              canReadMessages={canReadMessages}
              canPostMessages={canPostMessages}
              handlePostMessage={handlePostMessage}
              canDeleteMessage={canDeleteMessage}
              handleDeleteMessage={handleDeleteMessage}
              loading={loading || postingComment || deletingMessage}
              last={lastMessageOnly}
              maxHeight={COMMENTS_CONTAINER_HEIGHT}
              onClickMore={() => setIsFullViewDialogOpen(true)}
            />
          </CalloutLayout>
        </PageContentBlock>
        <Dialog
          open={isFullViewDialogOpen}
          PaperProps={{ sx: { padding: 0, display: 'flex', flexDirection: 'column' } }}
          fullScreen={!canFitRegularDialog}
        >
          <CalloutLayout
            callout={callout}
            calloutNames={calloutNames}
            contributionsCount={contributionsCount}
            onVisibilityChange={onVisibilityChange}
            onCalloutEdit={onCalloutEdit}
            onCalloutDelete={onCalloutDelete}
            actions={
              <IconButton onClick={() => setIsFullViewDialogOpen(false)}>
                <Close />
              </IconButton>
            }
          >
            <CommentsComponent
              messages={messages}
              commentsId={commentsId}
              canReadMessages={canReadMessages}
              canPostMessages={canPostMessages}
              handlePostMessage={handlePostMessage}
              canDeleteMessage={canDeleteMessage}
              handleDeleteMessage={handleDeleteMessage}
              loading={loading || postingComment || deletingMessage}
            />
          </CalloutLayout>
        </Dialog>
      </>
    );
  }
);

export default CommentsCallout;
