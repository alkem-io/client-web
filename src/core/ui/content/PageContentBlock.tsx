import { forwardRef } from 'react';
import { Paper, PaperProps, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { gutters } from '../grid/utils';
import GridProvider from '../grid/GridProvider';
import SwapColors from '../palette/SwapColors';

export interface PageContentBlockProps extends PaperProps {
  accent?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
}

const borderWidth = '1px';

const PageContentBlock = forwardRef<HTMLDivElement, PageContentBlockProps>(
  ({ accent = false, disablePadding = false, disableGap = false, halfWidth = false, sx, ...props }, ref) => {
    const mergedSx: Partial<SxProps<Theme>> = {
      padding: disablePadding ? undefined : theme => `calc(${gutters()(theme)} - ${borderWidth})`,
      display: disableGap ? undefined : 'flex',
      flexDirection: disableGap ? undefined : 'column',
      gap: disableGap ? undefined : gutters(),
      flexBasis: halfWidth ? 0 : '100%',
      flexGrow: halfWidth ? 1 : undefined,
      ...sx,
    };

    return (
      <SwapColors swap={accent}>
        <GridProvider columns={columns => (halfWidth ? columns! / 2 : columns!)}>
          <Paper ref={ref} sx={mergedSx} variant="outlined" {...props} />
        </GridProvider>
      </SwapColors>
    );
  }
);

export default PageContentBlock;
