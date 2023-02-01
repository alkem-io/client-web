import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';
import dayjs from 'dayjs';
import { DAYJS_DATEFORMAT } from '../../utils/time/utils';

interface AuthorshipProps {
  authorAvatarUri?: string;
  date?: string | Date;
  dateFormat?: string;
}

const Authorship = ({
  authorAvatarUri,
  date,
  dateFormat = DAYJS_DATEFORMAT,
  children,
}: PropsWithChildren<AuthorshipProps>) => {
  return (
    <Box display="flex" gap={gutters(0.5)}>
      <Box component="img" src={authorAvatarUri} height={gutters()} width={gutters()} sx={{ background: 'grey' }} />
      <Caption>{children}</Caption>
      {date && <Caption>{dayjs(date).format(dateFormat)}</Caption>}
    </Box>
  );
};

export default Authorship;
