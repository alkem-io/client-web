import { Box, BoxProps } from '@mui/material';

const NavigationBarSideContent = ({
  ref,
  ...props
}: BoxProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => <Box ref={ref} position="absolute" top={0} left={0} right={0} {...props} />;

export default NavigationBarSideContent;
