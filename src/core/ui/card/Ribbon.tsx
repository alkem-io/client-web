import { Box, BoxProps } from '@mui/material';

export interface RibbonProps extends BoxProps {}

export const Ribbon = ({ sx, ...rest }: RibbonProps) => (
  <Box padding={1.5} sx={{ color: 'neutralLight.main', backgroundColor: 'primary.main', ...sx }} {...rest} />
);
