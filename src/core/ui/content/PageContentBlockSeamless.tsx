import { Box, type BoxProps } from '@mui/material';
import type { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import type { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import BasePageContentBlock, { type BasePageContentBlockProps } from './BasePageContentBlock';

export interface PageContentBlockSeamlessProps
  extends BasePageContentBlockProps,
    Omit<BoxProps, 'flexWrap' | 'flex'>,
    PropsWithChildren {}

const PageContentBlockSeamless = ({
  ref,
  ...props
}: PageContentBlockSeamlessProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  return (
    <BasePageContentBlock
      ref={ref}
      padding={gutters() as SystemCssProperties<{}>['padding']}
      component={Box as any}
      {...props}
    />
  );
};

export default PageContentBlockSeamless;
