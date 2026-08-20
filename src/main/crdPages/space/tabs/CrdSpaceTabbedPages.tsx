import { Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';

const CrdSpaceTabPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceTabPage'));

type OutletContext = {
  activeTabIndex: number;
  totalTabs: number;
};

export default function CrdSpaceTabbedPages() {
  const { activeTabIndex, totalTabs } = useOutletContext<OutletContext>();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {activeTabIndex < totalTabs && <CrdSpaceTabPage tabPosition={activeTabIndex} />}
    </Suspense>
  );
}
