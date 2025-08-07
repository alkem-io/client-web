import { Paper, PaperProps } from '@mui/material';
import { gutters } from '../grid/utils';
import SwapColors from '../palette/SwapColors';
import { DroppableProvidedProps } from '@hello-pangea/dnd';
import BasePageContentBlock, { BasePageContentBlockProps } from './BasePageContentBlock';
import { PaperTypeMap } from '@mui/material/Paper/Paper';
import { Ref } from 'react';

export interface PageContentBlockProps extends BasePageContentBlockProps, PaperProps, Partial<DroppableProvidedProps> {
  accent?: boolean;
}

const borderWidth = '1px';

const OutlinedPaper = <D extends React.ElementType = PaperTypeMap['defaultComponent'], P = {}>({
  ...props
}: PaperProps<D, P> & {
  ref?: Ref<HTMLDivElement>;
}) => <Paper variant="outlined" {...props} />;

const PageContentBlock = ({
  accent = false,
  ...props
}: PageContentBlockProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <SwapColors swap={accent}>
      <BasePageContentBlock
        padding={theme => `calc(${gutters()(theme)} - ${borderWidth})`}
        component={OutlinedPaper}
        {...props}
      />
    </SwapColors>
  );
};
PageContentBlock.displayName = 'PageContentBlock';

export default PageContentBlock;
