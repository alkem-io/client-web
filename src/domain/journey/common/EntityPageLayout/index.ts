import { default as EntityPageLayoutImpl } from './EntityPageLayout';
import createLayoutHolderWithOutlet from '../../../../core/ui/layout/layoutHolder/LayoutHolderWithOutlet';
import { EntityPageLayoutProps, EntityTabsProps } from './EntityPageLayoutTypes';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';

const { LayoutHolder: EntityPageLayoutHolder, createLayout } = createLayoutHolderWithOutlet();

export const EntityPageLayout = createLayout(EntityPageLayoutImpl);

export const NotFoundPageLayout = createLayout(TopLevelLayout);

export { EntityPageLayoutHolder };
export type { EntityPageLayoutProps };
export type { EntityTabsProps };
