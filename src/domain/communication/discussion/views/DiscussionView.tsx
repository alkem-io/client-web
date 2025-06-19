import { FetchResult } from '@apollo/client';
import { Box, GridLegacy, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '@/domain/platform/admin/components/Common/Filter';
import MessageView from '@/domain/communication/room/Comments/MessageView';
import PostMessageToCommentsForm from '@/domain/communication/room/Comments/PostMessageToCommentsForm';
import { Message } from '@/domain/communication/room/models/Message';
import { Discussion } from '../models/Discussion';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { BlockSectionTitle, BlockTitle } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import Gutters from '@/core/ui/grid/Gutters';
import MessagesThread from '@/domain/communication/room/Comments/MessagesThread';

export interface DiscussionViewProps {
  discussion: Discussion;
  currentUserId?: string;
  postMessage: (comment: string) => Promise<FetchResult<unknown>> | void;
  postReply: (reply: { messageText: string; threadId: string }) => void;
  onUpdateDiscussion?: () => void;
  onDeleteDiscussion?: () => void;
  onDeleteComment?: (id: string) => void;
}

export const DiscussionView = ({
  discussion,
  currentUserId,
  postMessage,
  postReply,
  onUpdateDiscussion,
  onDeleteDiscussion,
  onDeleteComment,
}: DiscussionViewProps) => {
  const { t } = useTranslation();

  const { id, description, author, createdAt, comments, myPrivileges } = discussion;

  const canPostMessages = comments.myPrivileges?.includes(AuthorizationPrivilege.CreateMessage) ?? false;
  const canDeleteDiscussion = myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false;
  const canUpdateDiscussion = myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const canDeleteComment = (authorId?: string) =>
    (currentUserId && authorId && authorId === currentUserId) || canDeleteDiscussion;
  const canAddReaction = comments.myPrivileges?.includes(AuthorizationPrivilege.CreateMessageReaction) ?? false;

  // construct the discussion info as a comment with ID of the discussion for easier update/delete
  const initialComment: Message = useMemo(
    () => ({
      id,
      author,
      createdAt: createdAt!,
      message: description!,
      reactions: [],
    }),
    [id, author, createdAt, description]
  );

  const commentReactionsMutations = useCommentReactionsMutations(discussion.comments.id);

  return (
    <GridLegacy container spacing={2} alignItems="stretch" wrap="nowrap">
      <GridLegacy item xs={12} container direction="column">
        <GridLegacy item sx={{ width: '100%' }}>
          <Box display="flex" justifyContent="space-between">
            <BlockTitle height={gutters(3)}>{discussion.title}</BlockTitle>
            <ShareButton url={discussion.url} entityTypeName="discussion" />
          </Box>
          <MessageView
            message={initialComment}
            canDelete={canDeleteDiscussion}
            onDelete={onDeleteDiscussion}
            canUpdate={canUpdateDiscussion}
            onUpdate={onUpdateDiscussion}
            root
          />
        </GridLegacy>
        <GridLegacy item>
          {comments && (
            <>
              <Box paddingY={2}>
                <BlockSectionTitle>
                  {t('components.discussion.summary', {
                    comment: comments.messagesCount,
                  })}
                </BlockSectionTitle>
              </Box>
              <Filter data={comments.messages}>
                {filteredComments => {
                  if (filteredComments.length === 0) return null;
                  return (
                    <Gutters>
                      <MessagesThread
                        canPostMessages={canPostMessages}
                        messages={filteredComments}
                        canDeleteMessage={canDeleteComment}
                        onDeleteMessage={onDeleteComment}
                        onReply={postReply}
                        canAddReaction={canAddReaction}
                        {...commentReactionsMutations}
                      />
                    </Gutters>
                  );
                }}
              </Filter>
            </>
          )}
        </GridLegacy>
        <GridLegacy item container spacing={2}>
          <GridLegacy item xs={12}>
            <Box paddingY={2}>
              {canPostMessages && (
                <PostMessageToCommentsForm
                  onPostComment={comment => postMessage?.(comment)}
                  title={t('components.post-comment.fields.description.title')}
                  placeholder={t('components.post-comment.fields.description.placeholder')}
                />
              )}
              {!canPostMessages && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
                </Box>
              )}
            </Box>
          </GridLegacy>
        </GridLegacy>
      </GridLegacy>
    </GridLegacy>
  );
};

export default DiscussionView;
