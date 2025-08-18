import { Box, BoxProps, Paper } from '@mui/material';
import { gutters } from '../grid/utils';
import { useElevationContext } from '../utils/ElevationContext';

const NavigationItemContainer = ({
  sx,
  ...props
}: BoxProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => <Box component={Paper} elevation={useElevationContext()} height={gutters(2)} {...props} />;

export default NavigationItemContainer;
