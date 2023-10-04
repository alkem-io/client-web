import { default as EntityPageLayoutImpl } from './EntityPageLayout';
import createLayoutHolderWithOutlet from '../../../../core/ui/layout/layoutHolder/LayoutHolderWithOutlet';
import { EntityPageLayoutProps, EntityTabsProps } from './EntityPageLayoutTypes';
import TopLevelDesktopLayout from '../../../../main/ui/layout/TopLevelDesktopLayout';

const { LayoutHolder: EntityPageLayoutHolder, createLayout } = createLayoutHolderWithOutlet();

export const EntityPageLayout = createLayout(EntityPageLayoutImpl);

export const NotFoundPageLayout = createLayout(TopLevelDesktopLayout);

export { EntityPageLayoutHolder };
export type { EntityPageLayoutProps };
export type { EntityTabsProps };
