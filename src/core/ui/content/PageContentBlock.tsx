import { BoxProps, Paper, PaperProps, SxProps } from '@mui/material';
import { GUTTER_MUI } from '../grid/constants';

interface PageContentBlockProps {
  accent?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
}

const PageContentBlock = ({
  accent = false,
  disablePadding = false,
  disableGap = false,
  ...props
}: BoxProps & PaperProps & PageContentBlockProps) => {
  const sx: SxProps = {
    color: accent ? 'background.default' : undefined,
    backgroundColor: accent ? 'primary.main' : undefined,
    padding: disablePadding ? undefined : GUTTER_MUI,
    display: disableGap ? undefined : 'flex',
    flexDirection: disableGap ? undefined : 'column',
    gap: disableGap ? undefined : GUTTER_MUI,
  };

  return <Paper sx={sx} {...props} />;
};

export default PageContentBlock;
