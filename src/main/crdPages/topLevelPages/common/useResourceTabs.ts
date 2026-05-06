import { useState } from 'react';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';

/**
 * Active resource-tab state for the public profile pages (User + Organization)
 * — FR-013 / FR-024.
 *
 * NOTE: the active tab is held in **local React state only**; it is NOT synced
 * to a URL search param or path segment. Direct entry (reload, back/forward,
 * shared link) always lands on `'resourcesHosted'`.
 */
const useResourceTabs = (initial: ResourceTabKey = 'resourcesHosted') => {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>(initial);
  return {
    activeTab,
    onSelectTab: setActiveTab,
  };
};

export default useResourceTabs;
