import { Box, BoxProps, useMediaQuery, useTheme } from '@mui/material';
import { useGlobalGridColumns, MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import GridContainer, { GridContainerProps } from '../grid/GridContainer';

interface PageContentProps extends BoxProps {
  gridContainerProps?: GridContainerProps;
  background?: string;
}

const PageContent = ({
  children,
  sx,
  gridContainerProps,
  background = 'background.default',
  ...props
}: PageContentProps) => {
  const theme = useTheme();
  // TODO pass as a prop `mobile?: boolean` or through a context from e.g. EntityPageLayout
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const paddingBottom = isMobile ? 6 : 0;

  const globalGridColumns = useGlobalGridColumns();

  return (
    <Box component="main" flexGrow={1} sx={{ backgroundColor: background, paddingBottom, ...sx }} {...props}>
      <GridContainer maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX} marginX="auto" {...gridContainerProps}>
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </GridContainer>
    </Box>
  );
};

export default PageContent;
