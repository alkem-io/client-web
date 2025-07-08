import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { GUTTER_MUI } from '@/core/ui/grid/constants';
import { Caption } from '@/core/ui/typography';

const CalloutBlockMarginal = ({ children }: PropsWithChildren<{ variant: 'header' | 'footer' }>) => (
  <Box paddingY={GUTTER_MUI / 2} sx={theme => ({ color: theme.palette.primary.main })}>
    <Caption textAlign="center">{children}</Caption>
  </Box>
);

export default CalloutBlockMarginal;
