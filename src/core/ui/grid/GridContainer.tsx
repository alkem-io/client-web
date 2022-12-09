import { Box, BoxProps } from '@mui/material';
import { GUTTER_MUI } from './constants';

const GridContainer = (props: BoxProps) => {
  return <Box display="flex" flexDirection="row" flexWrap="wrap" gap={GUTTER_MUI} padding={GUTTER_MUI} {...props} />;
};

export default GridContainer;
