import { Box, Divider, Grid, Typography } from '@material-ui/core';
import ForumIcon from '@material-ui/icons/Forum';
import React, { FC } from 'react';
import DiscussionComment from '../../components/composite/common/Discussion/Comment';
import PostComment from '../../components/composite/common/Discussion/PostComment';
import DiscussionsLayout from '../../components/composite/layout/Discussions/DiscussionsLayout';
import Markdown from '../../components/core/Markdown';

// const AVATAR_MAX_COUNT = 3;

export interface DiscussionViewProps {
  title: string;
  createdBy: string;
  createdOn: string;
  subject: string;
  description: string;
  avatars: string[];
  count: number;
  comments: Comment[];
}

export interface Comment {
  commentId: string;
  message: string;
  createdOn: string;
  createdBy: string;
  depth: number;
}

// const useStyles = makeStyles(theme =>
//   createStyles({
//     avatar: {
//       height: theme.spacing(6),
//       width: theme.spacing(6),
//     },
//   })
// );

export const DiscussionView: FC<DiscussionViewProps> = ({
  title,
  subject,
  description,
  count,
  createdBy,
  createdOn,
  comments,
}) => {
  // const styles = useStyles();

  return (
    <DiscussionsLayout title={'Digital Twining - Discussion 1'}>
      <Grid container spacing={2} alignItems="stretch" wrap="nowrap">
        <Grid item xs={12} container direction="column">
          <Grid item>
            <Typography variant="h2">{title}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="h5">
              <Box display="flex">
                <Box component="i">{`${createdBy} initiated on ${createdOn}`}</Box>
                <Box marginLeft={1}>
                  <ForumIcon />
                </Box>
                <Box component="i">{`(${count})`}</Box>
              </Box>
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h5">
              <Box paddingY={2} fontWeight="700">
                {subject}
              </Box>
            </Typography>
          </Grid>
          <Grid item>
            <Typography>
              <Markdown>{description}</Markdown>
            </Typography>
          </Grid>

          <Grid item>
            {comments.map((c, i) => (
              <>
                <Divider />
                <DiscussionComment key={i} {...c} />
              </>
            ))}
          </Grid>

          <Divider />
          <Grid item container spacing={2}>
            <Grid item xs={12}>
              <Box paddingY={2}>
                <PostComment />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DiscussionsLayout>
  );
};
export default DiscussionView;
