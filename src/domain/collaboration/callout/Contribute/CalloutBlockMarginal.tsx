import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { BlockTitle } from '../../../../core/ui/typography';
import { GUTTER_MUI } from '../../../../core/ui/grid/constants';

interface CalloutBlockMarginalProps {
  variant: 'header' | 'footer';
}

const CalloutBlockMarginal = ({ variant, children }: PropsWithChildren<CalloutBlockMarginalProps>) => {
  const textTransform = variant === 'footer' ? 'uppercase' : undefined;

  return (
    <Box paddingY={GUTTER_MUI / 2} sx={{ color: 'background.paper', backgroundColor: 'primary.main' }}>
      <BlockTitle textAlign="center" textTransform={textTransform}>
        {children}
      </BlockTitle>
    </Box>
  );
};

export default CalloutBlockMarginal;
