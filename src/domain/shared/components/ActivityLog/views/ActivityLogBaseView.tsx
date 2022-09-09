import React, { FC, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatDate } from '../../../utils/formatDate';
import AuthorAvatar from '../../AuthorAvatar/AuthorAvatar';
import { Author } from '../../AuthorAvatar/models/author';


export interface ActivityLogBaseViewProps {
  author: Author;
  createdDate: Date;
  action: string;
  description: string;
}

export const ActivityLogBaseView: FC<ActivityLogBaseViewProps> = ({ author, createdDate, action, description }) => {
  const formattedTime = formatDate(createdDate);

  const title = useMemo(
    () => `${formattedTime} ${author.displayName} ${action}`,
    [formattedTime, author.displayName, action]
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AuthorAvatar author={author} />
      <Box ml={theme => theme.spacing(2)}>
        <Typography variant="caption">
          {title}
        </Typography>
        <Typography>
          {description}
        </Typography>
      </Box>
    </Box>
  );
};


