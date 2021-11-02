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
import { RouterLink } from '../../../core/RouterLink';

export interface DiscussionOverviewProps {
  id: string;
  title: string;
  description: string;
  date: Date;
  avatars: {
    name: string;
    src: string;
  }[];
  count: number;
}

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      height: theme.spacing(3.5),
      width: theme.spacing(3.5),
    },
  })
);

const DiscussionOverview: FC<DiscussionOverviewProps> = ({ id, title, description, count, date, avatars }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <ListItem alignItems="center" disableGutters>
      <ListItemText
        primary={
          <Typography color="primary" variant="h3">
            <Link component={RouterLink} to={`/discussions/${id}`}>
              {title}
            </Link>
          </Typography>
        }
        secondary={
          <Box display="flex" flexDirection="column">
            <Typography color="textPrimary">{description}</Typography>
            <Typography variant="body2">
              {t('components.discussions-list.posted', {
                date: date.toLocaleDateString(),
                count,
              })}
            </Typography>
          </Box>
        }
      />
      <ListItemAvatar>
        <AvatarGroup
          max={3}
          classes={{
            avatar: styles.avatar,
          }}
        >
          {avatars.map((a, i) => (
            <Avatar key={i} src={a.src}>
              {a.name[0]}
            </Avatar>
          ))}
        </AvatarGroup>
      </ListItemAvatar>
    </ListItem>
  );
};
export default DiscussionOverview;
