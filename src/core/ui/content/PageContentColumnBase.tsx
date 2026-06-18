import type { ComponentPropsWithoutRef, Ref } from 'react';
import { cn } from '@/crd/lib/utils';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import GridProvider from '../grid/GridProvider';
import { BlockAnchorProvider, NextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';
import SkipLink from '../keyboardNavigation/SkipLink';
import { extractSystemProps, resolveSx, type Sx } from '../typography/sx';

export type PageContentColumnBaseProps = ComponentPropsWithoutRef<'div'> & {
  columns: number;
  sx?: Sx;
  ref?: Ref<HTMLDivElement>;
  [key: string]: any;
};

/**
 * Grid container for page content blocks.
 * @constructor
 */
// gap = GUTTER_MUI (2) → MUI spacing 2 = 20px → Tailwind gap-5
const PageContentColumnBase = ({
  ref,
  columns,
  children,
  className,
  style,
  sx,
  ...props
}: PageContentColumnBaseProps) => {
  const combinedRef = useCombinedRefs<HTMLDivElement | null>(null, ref);
  const { style: systemStyle, rest: domProps } = extractSystemProps(props);

  return (
    <div
      ref={combinedRef}
      className={cn('flex flex-wrap content-start gap-5', className)}
      style={{ ...systemStyle, ...resolveSx(sx), ...style }}
      {...domProps}
    >
      <GridProvider columns={columns}>
        <BlockAnchorProvider blockRef={combinedRef}>
          {children}
          <NextBlockAnchor>
            <SkipLink />
          </NextBlockAnchor>
        </BlockAnchorProvider>
      </GridProvider>
    </div>
  );
};
PageContentColumnBase.displayName = 'PageContentColumnBase';

export default PageContentColumnBase;
