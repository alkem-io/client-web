import { Box, BoxProps } from '@mui/material';
import { gutters } from './utils';

export interface GridContainerProps extends BoxProps {
  disablePadding?: boolean;
  noWrap?: boolean;
}

const GridContainer = ({ disablePadding = false, noWrap = false, ...props }: GridContainerProps) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap={noWrap ? 'nowrap' : 'wrap'}
      alignItems="start"
      gap={gutters()}
      padding={disablePadding ? undefined : gutters()}
      {...props}
    />
  );
};

export default GridContainer;
