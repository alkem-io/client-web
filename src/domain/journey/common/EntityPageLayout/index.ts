import { default as EntityPageLayoutImpl } from './EntityPageLayout';
import createLayoutHolder from '../../../../core/ui/layout/layoutHolder/LayoutHolder';
import { EntityPageLayoutProps, EntityTabsProps } from './EntityPageLayoutTypes';
import TopLevelLayout from '../../../../main/ui/layout/TopLevelLayout';
import SubspacePageLayoutImpl from '../../subspace/layout/SubspacePageLayout';

const { LayoutHolder: EntityPageLayoutHolder, createLayout, RenderPoint } = createLayoutHolder();

export const EntityPageLayout = createLayout(EntityPageLayoutImpl);

export const NotFoundPageLayout = createLayout(TopLevelLayout);

export const SubspacePageLayout = createLayout(SubspacePageLayoutImpl);

export { EntityPageLayoutHolder, RenderPoint };
export type { EntityPageLayoutProps };
export type { EntityTabsProps };
