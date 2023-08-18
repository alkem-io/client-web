import createLayoutWithOutlet from '../../../../core/ui/layout/layoutHolder/LayoutHolderWithOutlet';
import { default as PostLayoutImpl } from './PostLayout';

const { LayoutHolder: PostLayoutHolder, createLayout } = createLayoutWithOutlet();

export const PostLayout = createLayout(PostLayoutImpl);

export { PostLayoutHolder };
