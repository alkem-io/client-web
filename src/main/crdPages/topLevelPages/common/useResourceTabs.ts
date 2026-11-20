import { useState } from 'react';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';

/**
 * Active-tab state for the profile resource tab strip. The visitor lands on the
 * first visible tab; an explicit pick sticks only while that tab stays visible
 * and the same profile (`profileId`) is shown — the route element is reused
 * across profiles, so a pick must not carry over to the next one.
 */
const useResourceTabs = (visibleTabs: ResourceTabKey[], profileId: string | undefined) => {
  const [selected, setSelected] = useState<{ profileId: string | undefined; tab: ResourceTabKey } | null>(null);

  const activeTab =
    selected && selected.profileId === profileId && visibleTabs.includes(selected.tab) ? selected.tab : visibleTabs[0];

  return {
    activeTab,
    onSelectTab: (tab: ResourceTabKey) => setSelected({ profileId, tab }),
  };
};

export default useResourceTabs;
