import { forwardRef } from 'react';
import { Paper, PaperProps } from '@mui/material';
import { gutters } from '../grid/utils';
import SwapColors from '../palette/SwapColors';
import { DroppableProvidedProps } from 'react-beautiful-dnd';
import BasePageContentBlock, { BasePageContentBlockProps } from './BasePageContentBlock';

export interface PageContentBlockProps extends BasePageContentBlockProps, PaperProps, Partial<DroppableProvidedProps> {
  accent?: boolean;
}

const borderWidth = '1px';

const OutlinedPaper = props => <Paper variant="outlined" {...props} />;

const PageContentBlock = forwardRef<HTMLDivElement, PageContentBlockProps>(({ accent = false, ...props }, ref) => {
  return (
    <SwapColors swap={accent}>
      <BasePageContentBlock
        ref={ref}
        padding={theme => `calc(${gutters()(theme)} - ${borderWidth})`}
        component={OutlinedPaper}
        {...props}
      />
    </SwapColors>
  );
});

export default PageContentBlock;
