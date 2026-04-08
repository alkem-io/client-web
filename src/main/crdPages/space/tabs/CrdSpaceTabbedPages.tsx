import { Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useCrdSpaceTabs } from '../hooks/useCrdSpaceTabs';

const CrdSpaceDashboardPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceDashboardPage'));
const CrdSpaceCommunityPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceCommunityPage'));
const CrdSpaceSubspacesPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceSubspacesPage'));
const CrdSpaceCustomTabPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceCustomTabPage'));

type OutletContext = {
  activeTabIndex: number;
};

export default function CrdSpaceTabbedPages() {
  const { activeTabIndex } = useOutletContext<OutletContext>();
  const { spaceId } = useUrlResolver();
  const { tabs } = useCrdSpaceTabs({ spaceId });

  const totalTabs = tabs.length;

  return (
    <Suspense fallback={<Loading />}>
      {activeTabIndex === 0 && <CrdSpaceDashboardPage />}
      {activeTabIndex === 1 && <CrdSpaceCommunityPage />}
      {activeTabIndex === 2 && <CrdSpaceSubspacesPage />}
      {activeTabIndex >= 3 && activeTabIndex < totalTabs && <CrdSpaceCustomTabPage sectionIndex={activeTabIndex} />}
    </Suspense>
  );
}
