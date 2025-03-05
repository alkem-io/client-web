import { forwardRef, PropsWithChildren } from 'react';
import { Box, BoxProps } from '@mui/material';
import { gutters } from '../grid/utils';
import BasePageContentBlock, { BasePageContentBlockProps } from './BasePageContentBlock';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';

export interface PageContentBlockSeamlessProps
  extends BasePageContentBlockProps,
    Omit<BoxProps, 'flexWrap' | 'flex'>,
    PropsWithChildren {}

const PageContentBlockSeamless = forwardRef<HTMLDivElement, PageContentBlockSeamlessProps>(
  (props: PageContentBlockSeamlessProps, ref) => {
    return (
      <BasePageContentBlock
        ref={ref}
        padding={gutters() as SystemCssProperties<{}>['padding']}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={Box as any}
        {...props}
      />
    );
  }
);

export default PageContentBlockSeamless;
