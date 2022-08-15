import createLayoutWithOutlet from '../../shared/layout/LayoutHolderWithOutlet';
import AspectLayout from './AspectLayout';

const { LayoutHolder, Layout } = createLayoutWithOutlet(AspectLayout);

export { LayoutHolder as AspectLayoutHolder };
export default Layout;
