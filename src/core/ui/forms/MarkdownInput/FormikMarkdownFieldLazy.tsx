import { Box } from '@mui/material';
import { type ComponentProps, Suspense } from 'react';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const LazyFormikMarkdownField = lazyWithGlobalErrorHandler(() => import('./FormikMarkdownField'));

const FormikMarkdownFieldLazy = (props: ComponentProps<typeof LazyFormikMarkdownField>) => (
  <Suspense fallback={<Box sx={{ minHeight: 120 }} />}>
    <LazyFormikMarkdownField {...props} />
  </Suspense>
);

export default FormikMarkdownFieldLazy;
