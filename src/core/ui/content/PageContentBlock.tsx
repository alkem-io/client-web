import { Paper, PaperProps, SxProps } from '@mui/material';
import { GUTTER_MUI } from '../grid/constants';
import GridProvider from '../grid/GridProvider';

interface PageContentBlockProps {
  accent?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
}

const PageContentBlock = ({
  accent = false,
  disablePadding = false,
  disableGap = false,
  halfWidth = false,
  sx,
  ...props
}: PaperProps & PageContentBlockProps) => {
  const mergedSx: Partial<SxProps> = {
    color: accent ? 'background.default' : undefined,
    backgroundColor: accent ? 'primary.main' : undefined,
    padding: disablePadding ? undefined : GUTTER_MUI,
    display: disableGap ? undefined : 'flex',
    flexDirection: disableGap ? undefined : 'column',
    gap: disableGap ? undefined : GUTTER_MUI,
    flexBasis: '100%',
    ...sx,
  };

  if (halfWidth) {
    const halfWidthStyles = {
      ...mergedSx,
      flexGrow: 1,
      flexBasis: 0,
    };

    return (
      <GridProvider columns={columns => columns! / 2}>
        <Paper sx={halfWidthStyles} {...props} />
      </GridProvider>
    );
  }

  return <Paper sx={mergedSx} {...props} />;
};

export default PageContentBlock;
