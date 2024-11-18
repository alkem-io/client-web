import { PropsWithChildren } from 'react';

import { isNumber } from 'lodash';
import { Box, Typography } from '@mui/material';

const EllipsableWithCount = ({ count, children }: PropsWithChildren<{ count: number }>) => (
  <Box component="span" display="flex" gap={0.5} flexGrow={1} minWidth={0}>
    <Typography component="span" variant="inherit" flexShrink={1} noWrap>
      {children}
    </Typography>

    <Box component="span" flexShrink={0}>
      {isNumber(count) && count > 0 && `(${count})`}
    </Box>
  </Box>
);

export default EllipsableWithCount;
