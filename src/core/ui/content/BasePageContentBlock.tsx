import { ComponentType, forwardRef, useRef } from 'react';
import { SxProps } from '@mui/material';
import { gutters, useGridItem } from '../grid/utils';
import GridProvider from '../grid/GridProvider';
import { useDeclaredColumns } from '../grid/GridContext';
import { SystemCssProperties } from '@mui/system/styleFunctionSx/styleFunctionSx';
import { Theme } from '@mui/material/styles';
import { useCombinedRefs } from '../../../domain/shared/utils/useCombinedRefs';
import { BlockAnchorProvider } from '../keyboardNavigation/NextBlockAnchor';
import { v4 as uuid } from 'uuid';

export interface BasePageContentBlockProps {
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
  columns?: number;
  row?: boolean;
  anchor?: string;
}

type BasePageContentBlockWithChildrenProps<Props extends { id?: string; sx?: SxProps }> = BasePageContentBlockProps & {
  component: ComponentType<Props>;
  padding: SystemCssProperties<Theme>['padding'];
} & Props;

const getFlexDirection = ({ row, disableGap }: { row: boolean; disableGap: boolean }) => {
  if (row) {
    return 'row';
  }
  if (!disableGap) {
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
      halfWidth = false,
      row = false,
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
      display: disableGap ? undefined : 'flex',
      flexDirection: getFlexDirection({ row, disableGap }),
      gap: disableGap ? undefined : gutters(),
      ...getGridItemStyle(columnsTaken),
      ...sx,
    };

    const combinedRef = useCombinedRefs(null, ref);

    const defaultAnchor = useRef(uuid()).current;

    return (
      <GridProvider columns={columnsTaken ?? gridColumns}>
        <BlockAnchorProvider block={combinedRef.current}>
          <Component ref={combinedRef} id={anchor ?? defaultAnchor} sx={mergedSx} {...(props as unknown as Props)} />
        </BlockAnchorProvider>
      </GridProvider>
    );
  }
);

export default BasePageContentBlock;
