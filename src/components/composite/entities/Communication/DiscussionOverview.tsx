import {
  Avatar,
  Box,
  createStyles,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { AvatarGroup } from '@material-ui/lab';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Discussion } from '../../../../models/discussion/discussion';
import { RouterLink } from '../../../core/RouterLink';

export interface DiscussionOverviewProps {
  discussion: Discussion;
}

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(3.5),
      width: theme.spacing(3.5),
    },
  })
);

const DiscussionOverview: FC<DiscussionOverviewProps> = ({ discussion }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { url } = useRouteMatch();

  const { id, title, description, createdAt, authors = [], totalComments } = discussion;

  return (
    <ListItem alignItems="center" disableGutters>
      <ListItemText
        primary={
          <Typography color="primary" variant="h3">
            <Link component={RouterLink} to={`${url}/${id}`}>
              {title}
            </Link>
          </Typography>
        }
        secondary={
          <Box display="flex" flexDirection="column">
            <Typography color="textPrimary">{description}</Typography>
            <Typography variant="body2">
              {t('components.discussions-list.posted', {
                date: createdAt.toLocaleDateString(),
                count: totalComments,
              })}
            </Typography>
          </Box>
        }
        disableTypography={true}
      />
      <ListItemAvatar>
        <AvatarGroup
          max={3}
          classes={{
            avatar: styles.avatar,
          }}
        >
          {authors.map((a, i) => (
            <Avatar key={i} src={a.avatarUrl}>
              {a.firstName[0]}
            </Avatar>
          ))}
        </AvatarGroup>
      </ListItemAvatar>
    </ListItem>
  );
};
export default DiscussionOverview;
