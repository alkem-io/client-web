import { Box, BoxProps, useMediaQuery, useTheme } from '@mui/material';
import { GRID_COLUMNS_DESKTOP, GRID_COLUMNS_MOBILE, MAX_CONTENT_WIDTH_WITH_GUTTER } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import GridContainer from '../grid/GridContainer';

const PageContent = ({ children, sx, ...props }: BoxProps) => {
  const breakpoint = useCurrentBreakpoint();

  const theme = useTheme();

  // TODO pass as a prop `mobile?: boolean` or through a context from e.g. EntityPageLayout
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const paddingBottom = isMobile ? 6 : 0;

  return (
    <Box flexGrow={1} sx={{ backgroundColor: 'background.default', paddingBottom, ...sx }} {...props}>
      <GridContainer maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER} marginX="auto">
        <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
          {children}
        </GridProvider>
      </GridContainer>
    </Box>
  );
};

export default PageContent;
