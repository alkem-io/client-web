import { default as EntityPageLayoutImpl } from './EntityPageLayout';
import createLayoutHolderWithOutlet from '../../../../core/ui/layout/layoutHolder/LayoutHolderWithOutlet';
import { EntityPageLayoutProps, EntityTabsProps } from './EntityPageLayoutTypes';

const { LayoutHolder: EntityPageLayoutHolder, createLayout } = createLayoutHolderWithOutlet();

export const EntityPageLayout = createLayout(EntityPageLayoutImpl);

export { EntityPageLayoutHolder };
export type { EntityPageLayoutProps };
export type { EntityTabsProps };
