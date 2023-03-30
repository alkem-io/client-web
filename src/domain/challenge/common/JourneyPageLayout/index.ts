import { default as EntityPageLayoutImpl } from './JourneyPageLayout';
import createLayoutHolderWithOutlet from '../../../../core/ui/layout/LayoutHolder/LayoutHolderWithOutlet';
import { EntityPageLayoutProps, EntityTabsProps } from './JourneyPageLayoutTypes';

const { LayoutHolder: EntityPageLayoutHolder, createLayout } = createLayoutHolderWithOutlet();

export const JourneyPageLayout = createLayout(EntityPageLayoutImpl);

export { EntityPageLayoutHolder };
export type { EntityPageLayoutProps };
export type { EntityTabsProps };
