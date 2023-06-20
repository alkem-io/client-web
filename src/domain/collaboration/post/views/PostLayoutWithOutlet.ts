import createLayoutWithOutlet from '../../../../core/ui/layout/LayoutHolder/LayoutHolderWithOutlet';
import { default as PostLayoutImpl } from './PostLayout';

const { LayoutHolder: PostLayoutHolder, createLayout } = createLayoutWithOutlet();

export const PostLayout = createLayout(PostLayoutImpl);

export { PostLayoutHolder };
