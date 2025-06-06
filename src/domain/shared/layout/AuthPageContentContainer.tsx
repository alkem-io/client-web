import { Box, BoxProps } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '@/core/ui/grid/constants';

const AuthPageContentContainer = (props: BoxProps) => {
  return (
    <Box
      maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX / 2}
      marginX="auto"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={gutters()}
      padding={gutters()}
      {...props}
    />
  );
};

export default AuthPageContentContainer;
