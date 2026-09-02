import { useState } from 'react';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';

const useResourceTabs = (initial: ResourceTabKey = 'resourcesHosted') => {
  const [activeTab, setActiveTab] = useState<ResourceTabKey>(initial);
  return {
    activeTab,
    onSelectTab: setActiveTab,
  };
};

export default useResourceTabs;
