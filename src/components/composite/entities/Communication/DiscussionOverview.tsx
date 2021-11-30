import {
  Avatar,
  AvatarGroup,
  Box,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { Discussion } from '../../../../models/discussion/discussion';
import { buildDiscussionUrl } from '../../../../utils/urlBuilders';
import { RouterLink } from '../../../core/RouterLink';
import DiscussionIcon from './DiscussionIcon';

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

const SHOW_AVATARS = false;

const DiscussionOverview: FC<DiscussionOverviewProps> = ({ discussion }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { url } = useRouteMatch();

  const { id, title, createdAt, author, authors = [], totalComments, category } = discussion;

  return (
    <ListItem alignItems="flex-start" disableGutters>
      <ListItemIcon>
        <DiscussionIcon color="primary" category={category} fontSize="large" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography color="primary" variant="h3">
            <Link component={RouterLink} to={buildDiscussionUrl(url, id)}>
              {title}
            </Link>
          </Typography>
        }
        secondary={
          <Box display="flex" flexDirection="column">
            <Typography variant="body2">
              {t('components.discussions-list.posted', {
                name: author?.displayName,
                date: createdAt.toLocaleDateString(),
                count: totalComments,
              })}
            </Typography>
          </Box>
        }
        disableTypography={true}
      />
      {SHOW_AVATARS && (
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
      )}
    </ListItem>
  );
};
export default DiscussionOverview;
