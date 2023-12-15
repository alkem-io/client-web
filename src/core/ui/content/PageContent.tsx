import { Box, BoxProps, useMediaQuery, useTheme } from '@mui/material';
import { useGlobalGridColumns, MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import GridContainer, { GridContainerProps } from '../grid/GridContainer';

interface PageContentProps extends BoxProps {
  gridContainerProps?: GridContainerProps;
  column?: boolean;
  reverseFlexDirection?: boolean;
  background?: string;
}

const PageContent = ({
  children,
  sx,
  gridContainerProps,
  column = false,
  reverseFlexDirection = false,
  background = 'background.default',
  ...props
}: PageContentProps) => {
  const theme = useTheme();
  // TODO pass as a prop `mobile?: boolean` or through a context from e.g. EntityPageLayout
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const paddingBottom = isMobile ? 6 : 0;

  const globalGridColumns = useGlobalGridColumns();
  const flexDirection: BoxProps['flexDirection'] = column
    ? reverseFlexDirection
      ? 'column-reverse'
      : 'column'
    : reverseFlexDirection
    ? 'row-reverse'
    : 'row';

  return (
    <Box component="main" flexGrow={1} sx={{ backgroundColor: background, paddingBottom, ...sx }} {...props}>
      <GridContainer
        maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX}
        marginX="auto"
        flexDirection={flexDirection}
        {...gridContainerProps}
      >
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </GridContainer>
    </Box>
  );
};

export default PageContent;
