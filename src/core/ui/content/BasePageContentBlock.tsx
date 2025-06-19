import { ComponentType, forwardRef, useRef } from 'react';
import { SxProps } from '@mui/material';
import { gutters, useGridItem } from '../grid/utils';
import GridProvider from '../grid/GridProvider';
import { useDeclaredColumns } from '../grid/GridContext';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Theme } from '@mui/material/styles';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { BlockAnchorProvider } from '../keyboardNavigation/NextBlockAnchor';
import { v4 as uuid } from 'uuid';

export interface BasePageContentBlockProps {
  flex?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
  fullHeight?: boolean;
  columns?: number;
  row?: boolean;
  flexWrap?: SystemCssProperties<Theme>['flexWrap'];
  anchor?: string;
}

type BasePageContentBlockWithChildrenProps<Props extends { id?: string; sx?: SxProps }> = BasePageContentBlockProps & {
  component: ComponentType<Props>;
  padding: SystemCssProperties<Theme>['padding'];
} & Props;

const getFlexDirection = ({ row, flex }: { row: boolean; flex: boolean }) => {
  if (row) {
    return 'row';
  }
  if (flex) {
    return 'column';
  }
  return undefined;
};

const BasePageContentBlock = forwardRef(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Props extends { id?: string; sx?: SxProps<any> }>(
    {
      disablePadding = false,
      disableGap = false,
      flex = !disableGap,
      halfWidth = false,
      row = false,
      flexWrap,
      fullHeight = false,
      columns,
      sx,
      component: Component,
      padding,
      anchor,
      ...props
    }: BasePageContentBlockWithChildrenProps<Props>,
    ref
  ) => {
    const gridColumns = useDeclaredColumns();

    const getGridItemStyle = useGridItem();

    const columnsTaken = halfWidth ? gridColumns / 2 : columns;

    const mergedSx: Partial<SxProps<Theme>> = {
      padding: disablePadding ? undefined : padding,
      display: flex ? 'flex' : undefined,
      flexDirection: getFlexDirection({ row, flex }),
      flexWrap,
      gap: disableGap ? undefined : gutters(),
      height: fullHeight ? '100%' : undefined,
      ...getGridItemStyle(columnsTaken),
      ...sx,
    };

    const combinedRef = useCombinedRefs(null, ref);

    const defaultAnchor = useRef(uuid()).current;

    return (
      <GridProvider columns={columnsTaken ?? gridColumns}>
        <BlockAnchorProvider blockRef={combinedRef}>
          <Component ref={combinedRef} id={anchor ?? defaultAnchor} sx={mergedSx} {...(props as unknown as Props)} />
        </BlockAnchorProvider>
      </GridProvider>
    );
  }
);
BasePageContentBlock.displayName = 'BasePageContentBlock';

export default BasePageContentBlock;
