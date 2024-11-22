import { Box, BoxProps } from '@mui/material';

const FlexSpacer = (props: BoxProps) => <Box flexGrow={1} flexShrink={1} flexBasis={0} {...props} />;

export default FlexSpacer;
