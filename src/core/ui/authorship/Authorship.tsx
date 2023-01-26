import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';

interface AuthorshipProps {
  authorAvatarUri?: string;
  date?: string | Date;
}

const Authorship = ({ authorAvatarUri, date, children }: PropsWithChildren<AuthorshipProps>) => {
  return (
    <Box display="flex" gap={gutters(0.5)}>
      <Box component="img" src={authorAvatarUri} height={gutters()} width={gutters()} sx={{ background: 'grey' }} />
      <Caption>
        {children}
      </Caption>
      {date && (
        <Caption>
          {date}
        </Caption>
      )}
    </Box>
  );
};

export default Authorship;
