import { Paper, PaperProps, SxProps } from '@mui/material';
import { GUTTER_MUI } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import SwapColors from '../palette/SwapColors';
import { forwardRef } from 'react';

export interface PageContentBlockProps extends PaperProps {
  accent?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
}

const PageContentBlock = forwardRef<HTMLDivElement, PageContentBlockProps>(
  ({ accent = false, disablePadding = false, disableGap = false, halfWidth = false, sx, ...props }, ref) => {
    const mergedSx: Partial<SxProps> = {
      padding: disablePadding ? undefined : GUTTER_MUI,
      display: disableGap ? undefined : 'flex',
      flexDirection: disableGap ? undefined : 'column',
      gap: disableGap ? undefined : GUTTER_MUI,
      flexBasis: halfWidth ? 0 : '100%',
      flexGrow: halfWidth ? 1 : undefined,
      ...sx,
    };

    return (
      <SwapColors swap={accent}>
        <GridProvider columns={columns => (halfWidth ? columns! / 2 : columns!)}>
          <Paper ref={ref} sx={mergedSx} {...props} />
        </GridProvider>
      </SwapColors>
    );
  }
);

export default PageContentBlock;
