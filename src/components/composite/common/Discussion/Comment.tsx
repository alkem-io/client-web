import { Avatar, Box, createStyles, Link, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
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
  commentId: string;
  message: string;
  createdOn: Date;
  createdBy: string;
  depth: number;
}

export const DiscussionComment: FC<DiscussionCommentProps> = ({ commentId, message, createdOn, createdBy, depth }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const depthPadding = depth > 0 ? depth * AVATAR_SIZE + 2 : 0;

  return (
    <Box paddingY={2} display="flex" justifyContent="space-between">
      <Box display="flex" flexDirection="row" paddingLeft={depthPadding}>
        <Avatar className={styles.avatar} src="">
          {createdBy[0]}
        </Avatar>
        <Box display="flex" flexDirection="column" paddingX={2}>
          <Typography>
            <Markdown>{message}</Markdown>
          </Typography>
          <Typography variant="body2">
            {t('components.comment.posted', {
              name: createdBy,
              date: createdOn.toLocaleDateString(),
            })}
            <Box component="span" marginX={1}>
              <Link arial-lable="reply" href={`#${commentId}`}>
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
