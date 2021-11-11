import { Avatar, Box, Link, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Comment } from '../../../../models/discussion/comment';
import Markdown from '../../../core/Markdown';

const AVATAR_SIZE = 8;

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(AVATAR_SIZE),
      width: theme.spacing(AVATAR_SIZE),
    },
  })
);

interface DiscussionCommentProps {
  comment: Comment;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ comment }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const { id, author, body, createdAt } = comment;

  const depth = 0;
  const depthPadding = depth > 0 ? depth * AVATAR_SIZE + 2 : 0;

  return (
    <Box paddingY={2} display="flex" justifyContent="space-between">
      <Box display="flex" flexDirection="row" paddingLeft={depthPadding}>
        <Avatar className={styles.avatar} src={author?.avatarUrl}>
          {author?.displayName[0]}
        </Avatar>
        <Box display="flex" flexDirection="column" paddingX={2}>
          <Typography>
            <Markdown>{body}</Markdown>
          </Typography>
          <Typography variant="body2">
            {t('components.comment.posted', {
              name: author?.displayName,
              date: createdAt.toLocaleString(),
            })}
            <Box component="span" marginX={1}>
              <Link arial-lable="reply" href={`#${id}`}>
                {t('components.comment.reply')}
              </Link>
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
export default DiscussionComment;
