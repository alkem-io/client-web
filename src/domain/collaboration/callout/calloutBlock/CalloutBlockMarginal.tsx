import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { BlockTitle } from '@core/ui/typography';
import { GUTTER_MUI } from '@core/ui/grid/constants';

interface CalloutBlockMarginalProps {
  variant: 'header' | 'footer';
}

const CalloutBlockMarginal = ({ children }: PropsWithChildren<CalloutBlockMarginalProps>) => {
  return (
    <Box paddingY={GUTTER_MUI / 2} sx={theme => ({ color: theme.palette.primary.main })}>
      <BlockTitle textAlign="center">{children}</BlockTitle>
    </Box>
  );
};

export default CalloutBlockMarginal;
