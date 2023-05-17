import { Box, BoxProps, useMediaQuery, useTheme } from '@mui/material';
import { GRID_COLUMNS_DESKTOP, GRID_COLUMNS_MOBILE, MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import GridContainer, { GridContainerProps } from '../grid/GridContainer';

interface PageContentProps extends BoxProps {
  gridContainerProps?: GridContainerProps;
  column?: boolean;
  background?: string;
}

const PageContent = ({
  children,
  sx,
  gridContainerProps,
  column = false,
  background = 'background.default',
  ...props
}: PageContentProps) => {
  const breakpoint = useCurrentBreakpoint();

  const theme = useTheme();

  // TODO pass as a prop `mobile?: boolean` or through a context from e.g. EntityPageLayout
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const paddingBottom = isMobile ? 6 : 0;

  return (
    <Box flexGrow={1} sx={{ backgroundColor: background, paddingBottom, ...sx }} {...props}>
      <GridContainer
        maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX}
        marginX="auto"
        flexDirection={column ? 'column' : undefined}
        {...gridContainerProps}
      >
        <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
          {children}
        </GridProvider>
      </GridContainer>
    </Box>
  );
};

export default PageContent;
