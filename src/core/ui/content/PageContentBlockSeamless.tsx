import { forwardRef, PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import BasePageContentBlock, { BasePageContentBlockProps } from './BasePageContentBlock';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';

export interface PageContentBlockSeamlessProps extends BasePageContentBlockProps, BoxProps, PropsWithChildren<{}> {}

const PageContentBlockSeamless = forwardRef<HTMLDivElement, PageContentBlockSeamlessProps>(
  (props: PageContentBlockSeamlessProps, ref) => {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <BasePageContentBlock
        ref={ref}
        padding={gutters() as SystemCssProperties<{}>['padding']}
        component={Box as any}
        {...props}
      />
    );
  }
);

export default PageContentBlockSeamless;
