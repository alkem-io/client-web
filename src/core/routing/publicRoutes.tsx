import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';

const PublicWhiteboardPage = lazy(() => import('@/main/public/whiteboard/PublicWhiteboardPage'));

/**
 * Public routes accessible without authentication
 */
export const publicRoutes: RouteObject[] = [
  {
    path: '/public/whiteboard/:whiteboardId',
    element: (
      <Suspense fallback={<Loading />}>
        <PublicWhiteboardPage />
      </Suspense>
    ),
  },
];
