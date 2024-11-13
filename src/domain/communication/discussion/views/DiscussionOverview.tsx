import { AvatarGroup, Box, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Avatar from '@core/ui/avatar/Avatar';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Discussion } from '../models/Discussion';
import DiscussionIcon from './DiscussionIcon';
import { BlockSectionTitle, Caption } from '@core/ui/typography';
import { formatLongDate } from '@core/utils/time/utils';

export interface DiscussionOverviewProps {
  discussion: Discussion;
  onClick?: (discussion: Discussion) => void;
}

const SHOW_AVATARS = false;

const DiscussionOverview: FC<DiscussionOverviewProps> = ({ discussion, onClick }) => {
  const { t } = useTranslation();

  const { title, createdAt, author, authors = [], comments, category } = discussion;

  return (
    <ListItemButton disableGutters onClick={() => onClick?.(discussion)}>
      <ListItemIcon sx={{ justifyContent: 'center' }}>
        <DiscussionIcon color="primary" category={category} fontSize="large" />
      </ListItemIcon>
      <ListItemText
        primary={<BlockSectionTitle>{title}</BlockSectionTitle>}
        secondary={
          <Box display="flex" flexDirection="column">
            <Caption>
              {t('components.discussions-list.posted', {
                name: author?.displayName,
                date: formatLongDate(createdAt),
                count: comments.messagesCount,
              })}
            </Caption>
          </Box>
        }
      />
      {SHOW_AVATARS && (
        <ListItemAvatar>
          <AvatarGroup max={3}>
            {authors.map((a, i) => (
              <Avatar
                key={i}
                src={a.avatarUrl}
                aria-label={t('common.avatar-of', { user: a.firstName[0] })}
                sx={theme => ({ height: theme.spacing(3.5), width: theme.spacing(3.5) })}
              >
                {a.firstName[0]}
              </Avatar>
            ))}
          </AvatarGroup>
        </ListItemAvatar>
      )}
    </ListItemButton>
  );
};

export default DiscussionOverview;
