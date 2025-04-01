import { default as EntityPageLayoutImpl } from './EntityPageLayout';
import createLayoutHolderWithOutlet from '@/core/ui/layout/layoutHolder/LayoutHolderWithOutlet';
import { EntityPageLayoutProps, EntityTabsProps } from './EntityPageLayoutTypes';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import SubspacePageLayoutImpl from '@/domain/space/layout/flowLayout/SubspacePageLayout';

const {
  LayoutHolder: EntityPageLayoutHolder,
  createLayout,
  RenderPoint,
  LayoutHolderWithOutlet: PageLayoutHolderWithOutlet,
} = createLayoutHolderWithOutlet();

export const EntityPageLayout = createLayout(EntityPageLayoutImpl);

export const NotFoundPageLayout = createLayout(TopLevelLayout);

export const SubspacePageLayout = createLayout(SubspacePageLayoutImpl);

export const EmptyLayout = createLayout(() => null);

export { EntityPageLayoutHolder, RenderPoint, PageLayoutHolderWithOutlet };
export type { EntityPageLayoutProps };
export type { EntityTabsProps };
