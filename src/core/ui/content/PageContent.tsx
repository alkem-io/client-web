import { Box, BoxProps } from '@mui/material';
import { GRID_COLUMNS_DESKTOP, GRID_COLUMNS_MOBILE, MAX_CONTENT_WIDTH_WITH_GUTTER } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import GridContainer from '../grid/GridContainer';

const PageContent = ({ children, ...props }: BoxProps) => {
  const breakpoint = useCurrentBreakpoint();

  return (
    <Box flexGrow={1} sx={{ backgroundColor: 'background.default' }} {...props}>
      <GridContainer maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER} marginX="auto">
        <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
          {children}
        </GridProvider>
      </GridContainer>
    </Box>
  );
};

export default PageContent;
