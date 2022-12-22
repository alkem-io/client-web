import createLayoutWithOutlet from '../../../../core/ui/layout/LayoutHolder/LayoutHolderWithOutlet';
import { default as AspectLayoutImpl } from './AspectLayout';

const { LayoutHolder: AspectLayoutHolder, createLayout } = createLayoutWithOutlet();

export const AspectLayout = createLayout(AspectLayoutImpl);

export { AspectLayoutHolder };
