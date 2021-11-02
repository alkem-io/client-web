import { Box, Divider, Grid, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Filter from '../../components/Admin/Common/Filter';
import DiscussionComment from '../../components/composite/common/Discussion/Comment';
import PostComment from '../../components/composite/common/Discussion/PostComment';
import Markdown from '../../components/core/Markdown';

export interface DiscussionViewProps {
  title: string;
  createdBy: string;
  createdOn: Date;
  description: string;
  avatars: string[];
  count: number;
  comments: Comment[];
}

export interface Comment {
  commentId: string;
  message: string;
  createdOn: Date;
  createdBy: string;
  depth: number;
}

export const DiscussionView: FC<DiscussionViewProps> = ({
  title,
  description,
  count,
  createdBy,
  createdOn,
  comments,
}) => {
  const { t } = useTranslation();

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
                  name: createdBy,
                  date: createdOn.toLocaleDateString(),
                  count,
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
          <Filter data={comments}>
            {filteredComments => {
              if (filteredComments.length === 0) return null;
              return (
                <Box marginTop={2}>
                  {filteredComments.map((c, i) => (
                    <>
                      <DiscussionComment key={i} {...c} />
                      <Divider />
                    </>
                  ))}
                </Box>
              );
            }}
          </Filter>
        </Grid>

        <Grid item container spacing={2}>
          <Grid item xs={12}>
            <Box paddingY={2}>
              <PostComment />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default DiscussionView;
