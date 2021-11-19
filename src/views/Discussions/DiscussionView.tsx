import { Box, Grid, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../components/Admin/Common/Filter';
import DiscussionComment from '../../components/composite/common/Discussion/Comment';
import PostComment from '../../components/composite/common/Discussion/PostComment';
import { Comment } from '../../models/discussion/comment';
import { Discussion } from '../../models/discussion/discussion';
import { AuthorizationPrivilege } from '../../models/graphql-schema';

export interface DiscussionViewProps {
  discussion: Discussion;
  currentUserId?: string;
  onPostComment?: (discussionId: string, comment: string) => Promise<void> | void;
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

  // construct the discussion info as a comment with ID of the discussion for easier update/delete
  const initialComment = {
    id,
    author,
    createdAt,
    body: description,
  } as Comment;

  return (
    <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
      <Grid item xs={12} container direction="column">
        <Grid item>
          <DiscussionComment comment={initialComment} canDelete={canDeleteDiscussion} onDelete={onDeleteDiscussion} />
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
                          <Grid item xs={12}>
                            <DiscussionComment
                              key={i}
                              comment={c}
                              canDelete={Boolean(currentUserId && c.author?.id === currentUserId)}
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
              {canPost && <PostComment onPostComment={comment => onPostComment && onPostComment(id, comment)} />}
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
