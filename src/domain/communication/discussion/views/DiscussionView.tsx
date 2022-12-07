import { FetchResult } from '@apollo/client';
import { Box, Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../../platform/admin/components/Common/Filter';
import MessageView from '../../../shared/components/Comments/MessageView';
import PostMessageToCommentsForm from '../../../shared/components/Comments/PostMessageToCommentsForm';
import { MID_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { Message } from '../../../shared/components/Comments/models/message';
import { Discussion } from '../models/discussion';
import { AuthorizationPrivilege } from '../../../../core/apollo/generated/graphql-schema';

export interface DiscussionViewProps {
  discussion: Discussion;
  currentUserId?: string;
  onPostComment?: (discussionId: string, comment: string) => Promise<FetchResult<unknown>> | void;
  onDeleteDiscussion?: (id: string) => Promise<void> | void;
  onDeleteComment?: (id: string) => Promise<void> | void;
}

export const DiscussionView: FC<DiscussionViewProps> = ({
  discussion,
  currentUserId,
  onPostComment,
  onDeleteDiscussion,
  onDeleteComment,
}) => {
  const { t } = useTranslation();

  const { id, description, author, authors, createdAt, totalComments, comments, myPrivileges } = discussion;

  const canPost = myPrivileges.some(x => x === AuthorizationPrivilege.Create);
  const canDeleteDiscussion = myPrivileges.some(x => x === AuthorizationPrivilege.Delete);
  const canDeleteComment = (authorId?: string) =>
    (currentUserId && authorId && authorId === currentUserId) || canDeleteDiscussion;

  // construct the discussion info as a comment with ID of the discussion for easier update/delete
  const initialComment = {
    id,
    author,
    createdAt,
    body: description,
  } as Message;

  return (
    <>
      <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
        <Grid item xs={12} container direction="column">
          <Grid item>
            <MessageView
              message={initialComment}
              canDelete={canDeleteDiscussion}
              onDelete={onDeleteDiscussion}
              isRootComment
            />
          </Grid>

          <Grid item>
            {comments && comments.length > 0 && (
              <>
                <Box paddingY={2}>
                  <Typography variant={'h4'}>
                    {t('components.discussion.summary', {
                      comment: totalComments,
                      contributed: authors.length,
                    })}
                  </Typography>
                </Box>
                <Filter data={comments}>
                  {filteredComments => {
                    if (filteredComments.length === 0) return null;
                    return (
                      <Box marginTop={2}>
                        <Grid container spacing={3}>
                          {filteredComments.map((c, i) => (
                            <Grid item xs={12} key={i}>
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
                    onPostComment={comment => onPostComment && onPostComment(id, comment)}
                    title={t('components.post-comment.fields.description.title')}
                    placeholder={t('components.post-comment.fields.description.placeholder')}
                    maxLength={MID_TEXT_LENGTH}
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
    </>
  );
};
export default DiscussionView;
