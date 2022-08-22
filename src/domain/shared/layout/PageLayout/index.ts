import SimplePageLayout from './SimplePageLayout';
import { default as EntityPageLayoutImpl, EntityPageLayoutProps } from './EntityPageLayout';
import createLayoutHolderWithOutlet from '../LayoutHolderWithOutlet';

const { LayoutHolder: EntityPageLayoutHolder, createLayout } = createLayoutHolderWithOutlet();

export const EntityPageLayout = createLayout(EntityPageLayoutImpl);

export { EntityPageLayoutHolder };
export type { EntityPageLayoutProps };

export { SimplePageLayout };
