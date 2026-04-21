import { Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';

const CrdSpaceDashboardPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceDashboardPage'));
const CrdSpaceCommunityPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceCommunityPage'));
const CrdSpaceSubspacesPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceSubspacesPage'));
const CrdSpaceCustomTabPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceCustomTabPage'));

type OutletContext = {
  activeTabIndex: number;
  totalTabs: number;
};

export default function CrdSpaceTabbedPages() {
  const { activeTabIndex, totalTabs } = useOutletContext<OutletContext>();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {activeTabIndex === 0 && <CrdSpaceDashboardPage />}
      {activeTabIndex === 1 && <CrdSpaceCommunityPage />}
      {activeTabIndex === 2 && <CrdSpaceSubspacesPage />}
      {activeTabIndex >= 3 && activeTabIndex < totalTabs && <CrdSpaceCustomTabPage sectionIndex={activeTabIndex} />}
    </Suspense>
  );
}
