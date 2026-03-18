import { Box } from '@mui/material';
import { type ComponentProps, Suspense } from 'react';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const LazyCollaborativeMarkdownInput = lazyWithGlobalErrorHandler(() => import('./CollaborativeMarkdownInput'));

const CollaborativeMarkdownInputLazy = (props: ComponentProps<typeof LazyCollaborativeMarkdownInput>) => (
  <Suspense fallback={<Box sx={{ minHeight: 120 }} />}>
    <LazyCollaborativeMarkdownInput {...props} />
  </Suspense>
);

export default CollaborativeMarkdownInputLazy;
