import createLayoutWithOutlet from '../../../shared/layout/LayoutHolderWithOutlet';
import { default as AspectLayoutImpl } from './AspectLayout';

const { LayoutHolder: AspectLayoutHolder, createLayout } = createLayoutWithOutlet();

export const AspectLayout = createLayout(AspectLayoutImpl);

export { AspectLayoutHolder };
