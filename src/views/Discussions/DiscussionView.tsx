import { Box, Grid, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../components/Admin/Common/Filter';
import DiscussionComment from '../../components/composite/common/Discussion/Comment';
import PostComment from '../../components/composite/common/Discussion/PostComment';
import { Discussion } from '../../models/discussion/discussion';
import { Comment } from '../../models/discussion/comment';
import TranslationKey from '../../types/TranslationKey';

export interface DiscussionViewProps {
  discussion: Discussion;
  onPostComment?: (discussionId: string, comment: string) => Promise<void> | void;
}

export const DiscussionView: FC<DiscussionViewProps> = ({ discussion, onPostComment }) => {
  const { t } = useTranslation();

  const { id, description, author, authors, createdAt, totalComments, comments } = discussion;

  const plural = authors.length !== 1;
  const summaryKey = `components.discussion.summary${plural ? '-  plural' : ''}` as TranslationKey;

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
          <DiscussionComment comment={initialComment} />
        </Grid>

        <Grid item>
          {comments && comments.length > 0 && (
            <>
              <Box paddingY={2}>
                <Typography variant={'h4'}>
                  {t(summaryKey, {
                    count: totalComments,
                    plural: totalComments === 1 ? '' : 's',
                    people: authors.length,
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
                            <DiscussionComment key={i} comment={c} />
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
              <PostComment onPostComment={comment => onPostComment && onPostComment(id, comment)} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default DiscussionView;
