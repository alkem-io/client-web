import { Box, BoxProps } from '@mui/material';
import { MAX_CONTENT_WIDTH_WITH_GUTTER_PX, useGlobalGridColumns } from '../grid/constants';
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
  const globalGridColumns = useGlobalGridColumns();

  return (
    <Box component="main" flexGrow={1} sx={{ backgroundColor: background, ...sx }} {...props}>
      <GridContainer maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX} marginX="auto" {...gridContainerProps}>
        <GridProvider columns={globalGridColumns}>{children}</GridProvider>
      </GridContainer>
    </Box>
  );
};

export default PageContent;
