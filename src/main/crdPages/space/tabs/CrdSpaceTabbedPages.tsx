import { Suspense } from 'react';
import { useOutletContext } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';

const CrdSpaceTabPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceTabPage'));

type OutletContext = {
  activeTabIndex: number;
  totalTabs: number;
  /** Opens the layout-owned shared About dialog (single mount, see CrdSpacePageLayout). */
  onOpenAbout: () => void;
};

export default function CrdSpaceTabbedPages() {
  const { activeTabIndex, totalTabs, onOpenAbout } = useOutletContext<OutletContext>();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {/* key: one collapsed instance serves every tab — remount on tab switch so
          per-tab local state (search pills, tag filters, dialog open-state)
          never leaks into another tab / flowStateID. */}
      {activeTabIndex < totalTabs && (
        <CrdSpaceTabPage key={activeTabIndex} tabPosition={activeTabIndex} onOpenAbout={onOpenAbout} />
      )}
    </Suspense>
  );
}
