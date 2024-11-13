import { FetchResult } from '@apollo/client';
import { Box, Grid, Typography } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../../platform/admin/components/Common/Filter';
import MessageView from '../../room/Comments/MessageView';
import PostMessageToCommentsForm from '../../room/Comments/PostMessageToCommentsForm';
import { Message } from '../../room/models/Message';
import { Discussion } from '../models/Discussion';
import { AuthorizationPrivilege } from '@core/apollo/generated/graphql-schema';
import { BlockSectionTitle, BlockTitle } from '@core/ui/typography';
import { gutters } from '@core/ui/grid/utils';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import useCommentReactionsMutations from '../../room/Comments/useCommentReactionsMutations';
import Gutters from '@core/ui/grid/Gutters';
import MessagesThread from '../../room/Comments/MessagesThread';

export interface DiscussionViewProps {
  discussion: Discussion;
  currentUserId?: string;
  postMessage: (comment: string) => Promise<FetchResult<unknown>> | void;
  postReply: (reply: { messageText: string; threadId: string }) => void;
  onUpdateDiscussion?: () => void;
  onDeleteDiscussion?: () => void;
  onDeleteComment?: (id: string) => void;
}

export const DiscussionView: FC<DiscussionViewProps> = ({
  discussion,
  currentUserId,
  postMessage,
  postReply,
  onUpdateDiscussion,
  onDeleteDiscussion,
  onDeleteComment,
}) => {
  const { t } = useTranslation();

  const { id, description, author, createdAt, comments, myPrivileges } = discussion;

  const canPost = comments.myPrivileges?.includes(AuthorizationPrivilege.CreateMessage) ?? false;
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
      body: description!,
      reactions: [],
    }),
    [id, author, createdAt, description]
  );

  const commentReactionsMutations = useCommentReactionsMutations(discussion.comments.id);

  return (
    <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
      <Grid item xs={12} container direction="column">
        <Grid item>
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
        </Grid>
        <Grid item>
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
                        canPostMessages
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
        </Grid>
        <Grid item container spacing={2}>
          <Grid item xs={12}>
            <Box paddingY={2}>
              {canPost && (
                <PostMessageToCommentsForm
                  onPostComment={comment => postMessage?.(comment)}
                  title={t('components.post-comment.fields.description.title')}
                  placeholder={t('components.post-comment.fields.description.placeholder')}
                />
              )}
              {!canPost && (
                <Box paddingY={4} display="flex" justifyContent="center">
                  <Typography variant="h4">{t('components.discussion.cant-post')}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DiscussionView;
