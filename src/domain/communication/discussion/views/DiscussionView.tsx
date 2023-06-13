import { FetchResult } from '@apollo/client';
import { Box, Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../../platform/admin/components/Common/Filter';
import MessageView from '../../../shared/components/Comments/MessageView';
import PostMessageToCommentsForm from '../../../shared/components/Comments/PostMessageToCommentsForm';
import { LONG_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { Message } from '../../messages/models/message';
import { Discussion } from '../models/Discussion';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';
import { BlockTitle, BlockSectionTitle } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';
import { buildDiscussionUrl } from '../../../../common/utils/urlBuilders';
import { useResolvedPath } from 'react-router-dom';

export interface DiscussionViewProps {
  discussion: Discussion;
  currentUserId?: string;
  onPostComment?: (comment: string) => Promise<FetchResult<unknown>> | void;
  onDeleteDiscussion?: () => void;
  onDeleteComment?: (id: string) => void;
}

export const DiscussionView: FC<DiscussionViewProps> = ({
  discussion,
  currentUserId,
  onPostComment,
  onDeleteDiscussion,
  onDeleteComment,
}) => {
  const { t } = useTranslation();

  const { id, description, author, authors, createdAt, comments, myPrivileges, nameID } = discussion;

  const canPost = comments.myPrivileges?.some(x => x === AuthorizationPrivilege.CreateMessage) ?? false;
  const canDeleteDiscussion = myPrivileges?.some(x => x === AuthorizationPrivilege.Delete) ?? false;
  const canDeleteComment = (authorId?: string) =>
    (currentUserId && authorId && authorId === currentUserId) || canDeleteDiscussion;

  // construct the discussion info as a comment with ID of the discussion for easier update/delete
  const initialComment = {
    id,
    author,
    createdAt,
    body: description,
  } as Message;

  const { pathname } = useResolvedPath('..');
  const discussionUrl = buildDiscussionUrl(pathname, nameID);

  return (
    <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
      <Grid item xs={12} container direction="column">
        <Grid item>
          <Box display="flex" justifyContent="space-between">
            <BlockTitle height={gutters(3)}>{discussion.title}</BlockTitle>
            <ShareButton url={discussionUrl} entityTypeName="discussion" />
          </Box>
          <MessageView
            message={initialComment}
            canDelete={canDeleteDiscussion}
            onDelete={onDeleteDiscussion}
            isRootComment
          />
        </Grid>
        <Grid item>
          {comments && (
            <>
              <Box paddingY={2}>
                <BlockSectionTitle>
                  {t('components.discussion.summary', {
                    comment: comments.messagesCount,
                    contributed: authors.length,
                  })}
                </BlockSectionTitle>
              </Box>
              <Filter data={comments.messages}>
                {filteredComments => {
                  if (filteredComments.length === 0) return null;
                  return (
                    <Box marginTop={2}>
                      <Grid container spacing={3}>
                        {filteredComments.map(c => (
                          <Grid item xs={12} key={c.id}>
                            <MessageView
                              message={c}
                              canDelete={canDeleteComment(c.author?.id)}
                              onDelete={onDeleteComment}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
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
                  onPostComment={comment => onPostComment?.(comment)}
                  title={t('components.post-comment.fields.description.title')}
                  placeholder={t('components.post-comment.fields.description.placeholder')}
                  maxLength={LONG_TEXT_LENGTH}
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
