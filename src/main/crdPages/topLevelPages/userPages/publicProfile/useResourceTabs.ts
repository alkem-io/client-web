import { useState } from 'react';
import type { ResourceTabKey } from '@/crd/components/user/UserResourceTabStrip';

/**
 * Active resource-tab state for the public User profile (FR-013).
 *
 * NOTE (FR-013 clarification): the active tab is held in **local React state
 * only**; it is NOT synced to a URL search param or path segment. Direct entry
 * (reload, back/forward, shared link) always lands on `'resourcesHosted'`.
 */
const useResourceTabs = (initial: ResourceTabKey = 'resourcesHosted') => {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>(initial);
  return {
    activeTab,
    onSelectTab: setActiveTab,
  };
};

export default useResourceTabs;
