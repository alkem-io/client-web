import { Box, Divider, Grid, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../components/Admin/Common/Filter';
import DiscussionComment from '../../components/composite/common/Discussion/Comment';
import PostComment from '../../components/composite/common/Discussion/PostComment';
import Markdown from '../../components/core/Markdown';
import { Discussion } from '../../models/discussion/discussion';

export interface DiscussionViewProps {
  discussion: Discussion;
  onPostComment?: (discussionId: string, comment: string) => Promise<void> | void;
}

export const DiscussionView: FC<DiscussionViewProps> = ({ discussion, onPostComment }) => {
  const { t } = useTranslation();

  const { id, title, description, author, createdAt, totalComments, comments } = discussion;

  return (
    <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
      <Grid item xs={12} container direction="column">
        <Grid item>
          <Typography variant="h2">{title}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5">
            <Box display="flex">
              <Box component="i">
                {t('components.discussion.posted', {
                  name: author?.displayName,
                  date: createdAt.toLocaleDateString(),
                  count: totalComments,
                })}
              </Box>
            </Box>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            <Markdown>{description}</Markdown>
          </Typography>
        </Grid>

        <Grid item>
          {comments && comments.length > 0 && (
            <Filter data={comments}>
              {filteredComments => {
                if (filteredComments.length === 0) return null;
                return (
                  <Box marginTop={2}>
                    {filteredComments.map((c, i) => (
                      <>
                        <DiscussionComment key={i} comment={c} />
                        <Divider />
                      </>
                    ))}
                  </Box>
                );
              }}
            </Filter>
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
