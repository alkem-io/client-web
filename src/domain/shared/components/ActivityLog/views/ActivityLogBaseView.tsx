import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatTimeElapsed } from '../../../utils/formatTimeElapsed';
import AuthorAvatar from '../../AuthorAvatar/AuthorAvatar';
import { Author } from '../../AuthorAvatar/models/author';
import { ClampedTypography } from '../../ClampedTypography';

export interface ActivityLogBaseViewProps {
  author: Author | undefined;
  createdDate: Date | string;
  action: string;
  description: string;
}

export const ActivityLogBaseView: FC<ActivityLogBaseViewProps> = ({ author, createdDate, action, description }) => {
  const { t } = useTranslation();

  const formattedTime = useMemo(() => formatTimeElapsed(createdDate), [createdDate]);

  const title = useMemo(
    () => `${formattedTime} ${author?.displayName ?? t('common.user')} ${action}`,
    [formattedTime, author?.displayName, action]
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AuthorAvatar author={author} />
      <Box ml={theme => theme.spacing(2)}>
        <Typography variant="caption">{title}</Typography>
        <ClampedTypography clamp={2}>{description}</ClampedTypography>
      </Box>
    </Box>
  );
};
