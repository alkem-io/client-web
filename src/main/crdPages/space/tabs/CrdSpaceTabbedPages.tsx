import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';

const CrdSpaceTabPage = lazyWithGlobalErrorHandler(() => import('./CrdSpaceTabPage'));

type OutletContext = {
  activeTabIndex: number;
  totalTabs: number;
  /** Opens the layout-owned shared About dialog (single mount, see CrdSpacePageLayout). */
  onOpenAbout: () => void;
  /** The space has stages whose visibility and current stage are not served yet (021 S01). */
  tabsUnavailable: boolean;
};

export default function CrdSpaceTabbedPages() {
  const { t } = useTranslation('crd-space');
  const { activeTabIndex, totalTabs, onOpenAbout, tabsUnavailable } = useOutletContext<OutletContext>();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {tabsUnavailable && <p className="text-body text-muted-foreground py-6 text-center">{t('tabs.unavailable')}</p>}
      {/* key: one collapsed instance serves every tab — remount on tab switch so
          per-tab local state (search pills, tag filters, dialog open-state)
          never leaks into another tab / flowStateID. */}
      {activeTabIndex >= 0 && activeTabIndex < totalTabs && (
        <CrdSpaceTabPage key={activeTabIndex} tabPosition={activeTabIndex} onOpenAbout={onOpenAbout} />
      )}
    </Suspense>
  );
}
