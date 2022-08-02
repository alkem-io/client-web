import SimplePageLayout from './SimplePageLayout';
import { default as EntityPageLayoutImpl, EntityPageLayoutProps } from './EntityPageLayout';
import createLayoutWithOutlet from '../LayoutHolderWithOutlet';

const { LayoutHolder: EntityPageLayoutHolder, Layout: EntityPageLayout } = createLayoutWithOutlet(EntityPageLayoutImpl);

export { EntityPageLayoutHolder, EntityPageLayout };
export type { EntityPageLayoutProps };

export { SimplePageLayout };
