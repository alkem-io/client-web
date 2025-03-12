import { ForwardedRef, forwardRef } from 'react';
import { Paper, PaperProps } from '@mui/material';
import { gutters } from '../grid/utils';
import SwapColors from '../palette/SwapColors';
import { DroppableProvidedProps } from 'react-beautiful-dnd';
import BasePageContentBlock, { BasePageContentBlockProps } from './BasePageContentBlock';
import { PaperTypeMap } from '@mui/material/Paper/Paper';

export interface PageContentBlockProps extends BasePageContentBlockProps, PaperProps, Partial<DroppableProvidedProps> {
  accent?: boolean;
}

const borderWidth = '1px';

const OutlinedPaper = forwardRef(
  <D extends React.ElementType = PaperTypeMap['defaultComponent'], P = {}>(
    props: PaperProps<D, P>,
    ref: ForwardedRef<HTMLDivElement>
  ) => <Paper ref={ref} variant="outlined" {...props} />
);

const PageContentBlock = forwardRef<HTMLDivElement, PageContentBlockProps>(({ accent = false, ...props }, ref) => {
  return (
    <SwapColors swap={accent}>
      <BasePageContentBlock
        ref={ref}
        padding={theme => `calc(${gutters()(theme)} - ${borderWidth})`}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={OutlinedPaper as any}
        {...props}
      />
    </SwapColors>
  );
});
PageContentBlock.displayName = 'PageContentBlock';

export default PageContentBlock;
