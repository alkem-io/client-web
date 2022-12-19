import { Box, BoxProps } from '@mui/material';
import { GUTTER_MUI } from './constants';

export interface GridContainerProps extends BoxProps {
  disablePadding?: boolean;
}

const GridContainer = ({ disablePadding, ...props }: GridContainerProps) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      alignItems="start"
      gap={GUTTER_MUI}
      padding={disablePadding ? undefined : GUTTER_MUI}
      {...props}
    />
  );
};

export default GridContainer;
