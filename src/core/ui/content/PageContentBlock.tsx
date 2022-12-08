import { BoxProps, Paper, PaperProps } from '@mui/material';
import { GRID_COLUMNS_BLOCK_WITH_CARDS } from '../grid/constants';
import GridContainer from '../grid/GridContainer';
import { useColumns } from '../grid/GridContext';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';

interface PageContentBlockProps {
  accent?: boolean;
  cards?: boolean;
}

const PageContentBlock = ({
  accent = false,
  cards = false,
  children,
  ...props
}: BoxProps & PaperProps & PageContentBlockProps) => {
  const gridColumns = useColumns();

  const sx = {
    color: accent ? 'background.default' : undefined,
    backgroundColor: accent ? 'primary.main' : undefined,
  };

  const breakpoint = useCurrentBreakpoint();

  const columns = cards ? (breakpoint === 'xs' ? 1 : GRID_COLUMNS_BLOCK_WITH_CARDS) : gridColumns;

  return (
    <GridContainer component={Paper} sx={sx} {...props}>
      <GridProvider columns={columns}>{children}</GridProvider>
    </GridContainer>
  );
};

export default PageContentBlock;
